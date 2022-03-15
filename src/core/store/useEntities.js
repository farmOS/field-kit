import { reactive, readonly } from 'vue';
import { useRouter } from 'vue-router';
import {
  clone, complement, compose, curryN, equals, is,
} from 'ramda';
import { validate, v4 as uuidv4 } from 'uuid';
import { parseBundles } from 'farmos/src/client/adapter';
import farm from '../farm';
import SyncScheduler from '../http/SyncScheduler';
import { syncEntities } from '../http/sync';
import { getRecords } from '../idb';
import { cacheEntity } from '../idb/cache';
import flattenEntity from '../utils/flattenEntity';
import asArray from '../utils/asArray';
import { STATUS_IN_PROGRESS, updateStatus } from './connection';
import { alert } from './alert';
import interceptor from '../http/interceptor';
import { PromiseQueue } from '../utils/promises';
import parseFilter from '../utils/parseFilter';
import nomenclature from './nomenclature';

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
  if (repeatable.length > 0) {
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

function findRepeatableBundles(entity, errors) {
  const bundles = [];
  const bundleRE = /^\/api\/([a-z]*)\/([a-z]*)/;
  errors.forEach((error) => {
    const { config: { url }, request, response } = error;
    const [, ent, bundle] = url.match(bundleRE);
    if (request && !response && bundle && ent === entity) {
      bundles.push(bundle);
    }
  });
  return bundles;
}

const collectionSyncHandler = (entity, filter, emitter) =>
  interceptor((evaluation) => {
    const {
      data, loginRequired, connectivity, repeatable, warnings,
    } = evaluation;
    data.forEach((value) => {
      emitter(value);
      cacheEntity(entity, value);
    });
    updateStatus(connectivity);
    if (warnings.length > 0) {
      alert(warnings);
    }
    const repeatableBundles = findRepeatableBundles(entity, repeatable);
    if (repeatableBundles.length > 0) {
      const repeatableFilters = parseBundles(filter, repeatableBundles);
      repeatableFilters.forEach(({ name: bundle, filter: bundleFilter }) => {
        const subscribe = scheduler.push(entity, bundle, bundleFilter);
        subscribe((results) => {
          results.data.forEach((value) => {
            emitter(value);
            cacheEntity(entity, value);
          });
        });
      });
    }
    if (loginRequired) {
      const router = useRouter();
      router.push('/login');
    }
  });

export default function useEntities() {
  // A collection of revisions, each corresponding to a unique call of the
  // checkout function and mapped to the read-only ref returned by that call.
  const revisions = new WeakMap();

  // Create a reference to a new entity. Just for internal use.
  function createEntity(entity, type, id) {
    const { shortName } = nomenclature.entities[entity];
    const _id = validate(id) ? id : uuidv4();
    const def = farm[shortName].create({ id: _id, type });
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
    return [reference, revision];
  }

  // A synchronous operation that returns a read-only, reactive array of entity
  // references, then updates those entities as new data comes in. When the
  // checkout function gets a filter instead of a type or id, it dispatches to
  // checkoutCollection internally, so this is not exposed publicly.
  function checkoutCollection(entity, filter) {
    const collection = reactive([]);
    const reference = readonly(collection);
    const query = parseFilter(filter);
    updateStatus(STATUS_IN_PROGRESS);
    // Upsert an entity in the collection when received from the db or remote.
    const emitter = ({ id, type, ...fields } = {}) => {
      if (typeof id !== 'string' || typeof type !== 'string') return;
      const i = collection.findIndex(item => item.id === id);
      if (i < 0) {
        const [itemRef, revision] = createEntity(entity, type, id);
        const { state: itemState } = revision;
        emit(itemState, fields);
        collection.push(itemRef);
      } else {
        const itemRef = collection[i];
        const { state: itemState } = revisions.get(itemRef);
        emit(itemState, fields);
      }
    };
    const { shortName } = nomenclature.entities[entity];
    getRecords('entities', entity, query).then((cache) => {
      cache.forEach(emitter);
      const syncOptions = { cache, filter };
      return syncEntities(shortName, syncOptions);
    }).then(collectionSyncHandler(entity, filter, emitter));
    return reference;
  }

  // A synchronous operation that immediately returns a read-only, reactive
  // reference to an entity, then updates that reference as new data comes in,
  // first from the local database, then from any remote systems.
  function checkout(entity, type, id) {
    const _entity = nomenclature.memoized[entity];
    if (!_entity) throw new Error(`Checkout failed; invalid entity name: ${entity}`);
    const { shortName } = nomenclature.entities[_entity];
    // Dispatch to checkoutCollection if the 2nd or 3rd param is a filter object.
    if (is(Object, type)) return checkoutCollection(_entity, type);
    if (is(Object, id)) {
      const filter = typeof type === 'string' ? { ...id, type } : id;
      return checkoutCollection(_entity, filter);
    }
    const [reference, revision] = createEntity(_entity, type, id);
    // Early return if this is a brand new entity.
    if (!validate(id)) return reference;
    const { queue, state } = revision;
    queue.push(() => {
      updateStatus(STATUS_IN_PROGRESS);
      return getRecords('entities', _entity, id).then(([, data]) => {
        if (data) emit(state, data);
        const syncOptions = { cache: asArray(data), filter: { id, type } };
        return syncEntities(shortName, syncOptions)
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
    if (is(Array, reference)) {
      return Promise.allSettled(reference.map(commit));
    }
    const revision = revisions.get(reference);
    const transactions = [...revision.transactions];
    revision.transactions = [];
    const {
      entity, type, id, queue, state,
    } = revision;
    const { shortName } = nomenclature.entities[entity];
    return queue.push((previous) => {
      updateStatus(STATUS_IN_PROGRESS);
      const fields = replay(previous, transactions);
      // The state will have had these transactions applied already, but may not
      // have received updates from a previous commit, so make sure to update it.
      emit(state, fields);
      const next = farm[shortName].update(previous, fields);
      return cacheEntity(entity, next).then(() => {
        const syncOptions = { cache: asArray(next), filter: { id, type } };
        return syncEntities(shortName, syncOptions)
          .then(syncHandler(revision))
          .then(({ data: [value] = [] } = {}) => value);
      });
    });
  }

  return {
    checkout, commit, revise,
  };
}
