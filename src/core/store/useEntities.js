import { reactive, readonly } from 'vue';
import {
  clone, complement, compose, curryN, equals, is,
} from 'ramda';
import { validate, v4 as uuidv4 } from 'uuid';
import farm from '../farm';
import nomenclature from './nomenclature';
import { getRecords } from '../idb';
import { syncEntities } from '../http/sync';
import { cacheEntity } from '../idb/cache';
import flattenEntity from '../utils/flattenEntity';
import asArray from '../utils/asArray';
import useRouter from './useRouter';
import { STATUS_IN_PROGRESS, updateStatus } from './connection';
import { alert } from './alert';
import interceptor from '../http/interceptor';
import parseFilter from '../utils/parseFilter';

function PromiseQueue(init) {
  this.init = Promise.resolve().then(init);
  this.pending = this.init;
  this.push = (next) => {
    const promise = this.pending.then(next);
    this.pending = promise;
    return promise;
  };
}

// An array of shortNames to ensure only valid entities are pushed onto the scheduler.
const entities = Object.values(nomenclature.entities).map(e => e.shortName);

const stringifyID = (entity, type, id) => JSON.stringify({ entity, type, id });
const parseID = string => JSON.parse(string);

function groupFilters(setOfPendingEntities) {
  const entityMap = new Map();
  entities.forEach((name) => { entityMap.set(name, new Map()); });
  setOfPendingEntities.forEach((idString) => {
    const { entity, type, id } = parseID(idString);
    const filters = entityMap.get(entity);
    let filter = filters.get(type);
    if (!filter) {
      filter = { type, id: [] };
      filters.set(type, filter);
    }
    filter.id.push(id);
  });
  const filterGroups = [];
  entityMap.forEach((filters, entity) => {
    filters.forEach((filter) => {
      filterGroups.push({ entity, filter });
    });
  });
  return filterGroups;
}

// Utility for safely calling listeners and callbacks w/o worrying about exceptions.
const safeCall = (callback, ...args) => {
  try {
    callback(...args);
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
  }
};

// By default, the interval doubles after each attempt (geometric backoff),
// until the seventh attempt, at which the interval becomes and remains 5 min.
const defaultIntervals = [
  5000, // 0:05
  10000, // 0:10
  20000, // 0:20
  40000, // 0:40
  80000, // 1:20
  160000, // 2:40
  300000, // 5:00
];

function SyncScheduler(intervals = defaultIntervals) {
  const pending = new Set();
  const listeners = new Map();

  async function retry() {
    const retrying = new Set(pending);
    pending.clear();
    const filterGroups = groupFilters(retrying);
    const requests = filterGroups.map(async (group) => {
      updateStatus(STATUS_IN_PROGRESS);
      const { entity, filter } = group;
      const query = parseFilter(filter);
      const cache = await getRecords('entities', entity, query);
      const results = await syncEntities(entity, { cache, filter });
      const handler = ({ connectivity, warnings }) => {
        updateStatus(connectivity);
        if (warnings.length > 0) {
          alert(warnings);
        }
      };
      const { data } = interceptor(handler, results);
      data.forEach((value) => {
        if (!farm.meta.isUnsynced(value)) {
          const { type, id } = value;
          const idString = stringifyID(entity, type, id);
          retrying.delete(idString);
          // Use optional chaining in case an earlier retry already deleted it.
          listeners.get(idString)?.forEach((listener) => {
            safeCall(listener, value);
          });
          listeners.delete(idString);
        }
      });
      // Any entities that still haven't been synced are added back to pending.
      retrying.forEach((idString) => { pending.add(idString); });
      const cacheRequests = data.map(value => cacheEntity(entity, value));
      return Promise.allSettled(cacheRequests);
    });
    return Promise.allSettled(requests);
  }

  function startClock(i = 0) {
    const interval = i < intervals.length
      ? intervals[i]
      : intervals[intervals.length - 1];
    setTimeout(() => {
      retry().finally(() => {
        if (pending.size > 0) {
          startClock(i + 1);
        }
      });
    }, interval);
  }

  this.push = function push(entity, type, id) {
    if (!entities.includes(entity)) {
      throw new Error(`Invalid entity name: ${entity}`);
    }
    const idString = stringifyID(entity, type, id);
    if (pending.size === 0) startClock();
    pending.add(idString);
    return function subscribe(listener) {
      if (typeof listener !== 'function') {
        throw new Error(`Listener for ${type} ${entity} must be a function; `
          + `received '${typeof listener}'`);
      }
      let entityListeners = listeners.get(idString);
      if (!entityListeners) {
        entityListeners = [];
        listeners.set(idString, entityListeners);
      }
      entityListeners.push(listener);
    };
  };
}

const scheduler = new SyncScheduler();

// Emit takes the reactive state of an entity and updates its fields based on
// new data, thereby "emitting" those changes to any dependent components.
const emit = curryN(2, (state, data = {}) => {
  const {
    id, type, meta, attributes, relationships, ...rest
  } = data;
  const fields = { ...attributes, ...relationships, ...rest };
  Object.entries(fields).forEach(([key, val]) => {
    state[key] = val;
  });
  return data;
});

// For checking strict non-equivalence, including cyclical data structures, as
// a condition for applying a transaction.
const notEq = complement(equals);
// Flatten AND clone, for safe mutations within the replay scope.
const flatten = compose(clone, flattenEntity);

// Replay revision history based on the previous saved state and a series of
// atomic transactions. Only the changed fields are returned.
const replay = (previous, transactions) => {
  const fieldSet = new Set();
  const current = flatten(previous);
  transactions.forEach((tx) => {
    const txFields = tx(current);
    Object.entries(txFields).forEach(([key, value]) => {
      if (notEq(current[key], value)) {
        current[key] = value;
        fieldSet.add(key);
      }
    });
  });
  const fields = {};
  fieldSet.forEach((field) => {
    if (notEq(current[field], previous[field])) {
      fields[field] = current[field];
    }
  });
  return fields;
};

const syncHandler = revision => interceptor((evaluation) => {
  const {
    entity, type, id, state,
  } = revision;
  const {
    loginRequired, connectivity, repeatable, warnings, data: [value] = [],
  } = evaluation;
  updateStatus(connectivity);
  if (warnings.length > 0) {
    alert(warnings);
  }
  if (repeatable.length > 0 && typeof retry === 'function') {
    const subscribe = scheduler.push(entity, type, id);
    subscribe((data) => {
      emit(state, data);
    });
  }
  if (loginRequired) {
    const router = useRouter();
    router.push('/login');
  }
  if (value) {
    emit(state, value);
    cacheEntity(entity, value).catch(alert);
  }
});

export default function useEntities() {
  // A collection of revisions, each corresponding to a unique call of the
  // checkout function and mapped to the read-only ref returned by that call.
  const revisions = new WeakMap();

  // Create a reference to a new entity. This is essentially what checkout
  // dispatches to when a valid id is not provided as its third argument.
  function create(entity, type, id) {
    const _id = validate(id) ? id : uuidv4();
    const def = farm[entity].create({ id: _id, type });
    const defaultFields = {
      id: _id, type, ...def.attributes, ...def.relatinships,
    };
    const state = reactive(defaultFields);
    const reference = readonly(state);
    const queue = new PromiseQueue(def);
    const revision = {
      entity, type, id: _id, state, transactions: [], queue,
    };
    revisions.set(reference, revision);
    return reference;
  }

  // A synchronous operation that immediately returns a read-only, reactive
  // reference to an entity, then updates that reference as new data comes in,
  // first from the local database, then from any remote systems.
  function checkout(entity, type, id) {
    const reference = create(entity, type, id);
    // Early return if this is a brand new entity.
    if (!validate(id)) return reference;
    const revision = revisions.get(reference);
    const { queue, state } = revision;
    queue.push(() => {
      updateStatus(STATUS_IN_PROGRESS);
      return getRecords('entities', entity, id).then(([, data]) => {
        if (data) emit(state, data);
        const syncOptions = { cache: asArray(data), filter: { id, type } };
        return syncEntities(entity, syncOptions)
          .then(syncHandler(revision))
          .then(results => results?.data?.[0]);
      });
    });
    return reference;
  }

  // A synchronous operation that updates the reference but does not persist
  // that update in the local database or send it to any remote. Instead, it
  // holds onto the transaction so it can be replayed by the commit function.
  function revise(reference, transaction) {
    let fields = {}; let tx = () => fields;
    if (typeof transaction === 'function') tx = transaction;
    if (is(Object, transaction)) fields = transaction;
    const { state, transactions } = revisions.get(reference);
    fields = tx(reference);
    transactions.push(tx);
    emit(state, fields);
  }

  // An ASYNCHRONOUS operation, which replays all transactions based on the
  // current state of the entity at the time of calling, then writes those
  // changes to the local database and sends them on to remote systems.
  function commit(reference) {
    const revision = revisions.get(reference);
    const transactions = [...revision.transactions];
    revision.transactions = [];
    const {
      entity, type, id, queue, state,
    } = revision;
    return queue.push((previous) => {
      updateStatus(STATUS_IN_PROGRESS);
      const fields = replay(previous, transactions);
      // The state will have had these transactions applied already, but may not
      // have received updates from a previous commit, so make sure to update it.
      emit(state, fields);
      const next = farm[entity].update(previous, fields);
      return cacheEntity(entity, next).then(() => {
        const syncOptions = { cache: asArray(next), filter: { id, type } };
        return syncEntities(entity, syncOptions)
          .then(syncHandler(revision))
          .then(({ data: [value] = [] } = {}) => value);
      });
    });
  }

  return {
    checkout, commit, revise,
  };
}
