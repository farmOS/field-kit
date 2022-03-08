import { reactive, readonly } from 'vue';
import {
  clone, complement, compose, curryN, equals, is, reduce,
} from 'ramda';
import farm from '../farm';
import { getRecords } from '../idb';
import { syncEntities } from '../http/sync';
import { cacheEntity } from '../idb/cache';
import flattenEntity from '../utils/flattenEntity';
import asArray from '../utils/asArray';
import useRouter from './useRouter';
import { updateStatus } from './connection';
import { alert } from './alert';
import interceptor from '../http/interceptor';

function PromiseQueue(init) {
  this.init = Promise.resolve().then(init);
  this.pending = this.init;
  this.push = (next) => {
    const promise = this.pending.then(next);
    this.pending = promise;
    return promise;
  };
}

function syncHandler(evaluation) {
  const {
    loginRequired,
    connectivity,
    alerts,
    // reschedule,
    // notFound,
  } = evaluation;
  updateStatus(connectivity);
  if (alerts.length > 0) {
    alert(alerts);
  }
  if (loginRequired) {
    const router = useRouter();
    router.push('/login');
  }
}

// A "reader" or "writer" returns a list of async read/write operations, which
// can be passed to and evaluated by an instance of PromiseQueue.
const reader = (entity, type, id) => [
  () => getRecords('entities', entity, id).then(([, data]) => data),
  data => syncEntities(entity, { cache: asArray(data), filter: { id, type } })
    .then(results => interceptor(results, syncHandler))
    .then(({ data: [value] = [] } = {}) => value),
];
const writer = (entity, type, id) => [
  data => syncEntities(entity, { cache: asArray(data), filter: { id, type } })
    .then(results => interceptor(results, syncHandler))
    .then(({ data: [value] = [] } = {}) => value),
  data => cacheEntity(entity, data, { now: Date.now() }),
];

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

export default function useEntities() {
  // A collection of revisions, each corresponding to a unique call of the
  // checkout function and mapped to the read-only ref returned by that call.
  const revisions = new WeakMap();

  // A synchronous operation that immediately returns a read-only, reactive
  // reference to an entity, then updates that reference as new data comes in,
  // first from the local database, then from any remote systems.
  function checkout(entity, type, id) {
    const def = farm[entity].create({ id, type });
    const defaultFields = {
      id, type, ...def.attributes, ...def.relatinships,
    };
    const state = reactive(defaultFields);
    const reference = readonly(state);
    const queue = new PromiseQueue(def);
    const revision = {
      entity, type, id, state, transactions: [], queue,
    };
    revisions.set(reference, revision);
    const read = reader(entity, type, id);
    read.forEach((request) => {
      queue.push(request).then(emit(state));
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
    const initWrite = queue.push((previous) => {
      const fields = replay(previous, transactions);
      // The state will have had these transactions applied already, but may not
      // have received updates from a previous commit, so make sure to update it.
      emit(state, fields);
      const next = farm[entity].update(previous, fields);
      return Promise.resolve(next);
    });
    // Currently the results of each write are not being used, and the execution
    // will only return the results of the last write, but it would be useful
    // to track which writes succeeded and which failed in the future.
    const execWrite = (prevWrite, nextWrite) =>
      queue.push(nextWrite).then(emit(state));
    return reduce(execWrite, initWrite, writer(entity, type, id));
  }

  return {
    checkout, commit, revise,
  };
}
