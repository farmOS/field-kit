import {
  isProxy, isRef, reactive, readonly, ref, shallowReactive, unref, watch, watchEffect,
} from 'vue';
import {
  clone, complement, compose, curryN, equals, is, none, propEq,
} from 'ramda';
import { validate, v4 as uuidv4 } from 'uuid';
import { splitFilterByType } from 'farmos';
import farm from '../farm';
import router from '../router';
import SyncScheduler from '../http/SyncScheduler';
import { syncEntities } from '../http/sync';
import { getRecords } from '../idb';
import { cacheEntity } from '../idb/cache';
import flattenEntity from '../utils/flattenEntity';
import asArray from '../utils/asArray';
import { STATUS_IN_PROGRESS, updateStatus } from '../http/connection';
import { alert } from '../warnings/alert';
import interceptor from '../http/interceptor';
import { PromiseQueue } from '../utils/promises';
import parseFilter from '../utils/parseFilter';
import nomenclature from './nomenclature';
import {
  backupTransactions, clearBackup, restoreTransactions,
} from './backup';

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
    router.push('/login');
  }
  if (value) {
    emit(state, value);
    cacheEntity(entity, value).catch(alert);
  }
});

function findRepeatableTypes(entity, errors) {
  const types = [];
  const bundleRE = /^\/api\/([a-z]*)\/([a-z]*)/;
  errors.forEach((error) => {
    const { config: { url }, request, response } = error;
    const [, e, b] = url.match(bundleRE);
    if (request && !response && b && e === entity) {
      const type = `${e}--${b}`;
      types.push(type);
    }
  });
  return types;
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
    const repeatableTypes = findRepeatableTypes(entity, repeatable);
    if (repeatableTypes.length > 0) {
      const repeatableFilters = splitFilterByType(filter, repeatableTypes);
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
      router.push('/login');
    }
  });

export default function useEntities(options = {}) {
  // A record of all revisions, each corresponding to a unique call of the
  // checkout function and mapped to the read-only ref returned by that call.
  const revisions = new WeakMap();
  // For tracking collections of entities, which in turn have their own revisions
  // tracked individually above. This is primarily for appending new items to
  // the collection, but may be useful for attaching listeners in the future.
  const collections = new WeakMap();
  // A store of Vue watch/unwatch callbacks, used when linking an entity or
  // collection of entities to another entity's reactive state.
  const linkWatchers = new WeakMap();

  const { module: modConfig } = options;

  function identifyRoute() {
    const current = router.currentRoute.value;
    if (current.path !== '/home' || !is(Object, modConfig)) return current;
    // If useEntities being called from the '/home' route it's a module widget.
    // In this case, identify the module, then find its top-level route record.
    const { routes: [record = {}] = [] } = modConfig;
    if (!record.path) return current;
    return router.resolve(record.path);
  }

  // Create a reference to a new entity. Just for internal use.
  function createEntity(entity, type, id) {
    const { shortName } = nomenclature.entities[entity];
    const _id = validate(id) ? id : uuidv4();
    const def = farm[shortName].create({ id: _id, type });
    const defaultFields = {
      id: _id, type, ...def.attributes, ...def.relationships,
    };
    const state = reactive(defaultFields);
    const reference = readonly(state);
    const queue = new PromiseQueue(def);
    const route = identifyRoute();
    const [backupURI, transactions] = restoreTransactions(entity, type, _id, route);
    const revision = {
      entity, type, id: _id, state, transactions, queue, backupURI,
    };
    revisions.set(reference, revision);
    return [reference, revision];
  }

  // Create a reference to a single entity without yet committing it.
  function add(entity, type, fields = {}) {
    const [reference, revision] = createEntity(entity, type, fields?.id);
    const { queue, state: itemState } = revision;
    queue.push(() => emit(itemState, fields));
    return reference;
  }

  // Create a new entity and add it to an existing collection.
  function append(collectionReference, type, fields) {
    const collection = collections.get(collectionReference);
    const { entity, state: collectionState } = collection;
    const itemReference = add(entity, type, fields);
    collectionState.push(itemReference);
    return itemReference;
  }

  // Remove an entity from a collection of entities. This discards any pending
  // revisions, but does not delete the entity from local or remote persistence.
  function drop(collectionReference, id) {
    const collection = collections.get(collectionReference);
    const { state: collectionState } = collection;
    const i = collectionState.findIndex(item => item.id === id);
    const itemRef = collectionReference[i];
    collectionState.splice(i, 1);
    return itemRef;
  }

  // Upsert an entity in the collection.
  const emitCollection = reference => (value = {}) => {
    const { id, type, ...fields } = value;
    const { state } = collections.get(reference);
    if (typeof id !== 'string' || typeof type !== 'string') return;
    const i = state.findIndex(item => item.id === id);
    if (i < 0) {
      append(reference, type, value);
    } else {
      const itemRef = state[i];
      const { state: itemState } = revisions.get(itemRef);
      emit(itemState, fields);
    }
  };

  // A synchronous operation that returns a read-only, reactive array of entity
  // references, then updates those entities as new data comes in. When the
  // checkout function gets a filter instead of a type or id, it dispatches to
  // checkoutCollection internally, so this is not exposed publicly.
  function checkoutCollection(entity, filter) {
    const state = shallowReactive([]);
    const reference = readonly(state);
    const collection = { entity, filter, state };
    collections.set(reference, collection);
    const query = parseFilter(filter);
    updateStatus(STATUS_IN_PROGRESS);
    const { shortName } = nomenclature.entities[entity];
    getRecords('entities', entity, query).then((cache) => {
      cache.forEach(emitCollection(reference));
      const syncOptions = { cache, filter };
      return syncEntities(shortName, syncOptions);
    }).then(collectionSyncHandler(entity, filter, emitCollection(reference)))
      .then(() => {
        state.forEach((itemRef) => {
          const { state: itemState, transactions } = revisions.get(itemRef);
          const fields = replay(itemState, transactions);
          emit(itemState, fields);
        });
      });
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
    const { queue, state, transactions } = revision;
    queue.push(() => {
      updateStatus(STATUS_IN_PROGRESS);
      return getRecords('entities', _entity, id).then(([, data]) => {
        if (data) emit(state, data);
        const syncOptions = { cache: asArray(data), filter: { id, type } };
        return syncEntities(shortName, syncOptions)
          .then(syncHandler(revision))
          .then(({ data: [value] = [] } = {}) => {
            const fields = replay(value, transactions);
            emit(state, fields);
            return value;
          });
      });
    });
    return reference;
  }

  // Checkout the entity or a collection of entities related to another that's
  // already been checked out (ie, `origReference`). The linked reference will
  // be updated reactively if a resource identifier changes in the corresponding
  // relationship field of the original reference.
  function link(origRef, relationship, entity) {
    if (!isProxy(origRef) && !isRef(origRef)) {
      const msg = `Invalid reference while linking the ${relationship} relationship.`
        + ' Provide a reference to another entity that has already been checked out,'
        + ' or use valid Vue ref or reactive object as a placeholder.';
      throw new Error(msg);
    }
    const state = ref(null);
    const linkedRef = readonly(state);
    revisions.set(linkedRef, { entity, state });
    // Helper for updating changes to one-to-many relationships.
    const ifMissing = (arrA = [], arrB = [], cb) => arrA.forEach((a) => {
      if (none(propEq('id', a.id), arrB)) { cb(a); }
    });
    const update = (next, prev) => {
      if (!next && validate(prev?.id)) state.value = null;
      if (validate(next?.id) && next.id !== prev?.id) {
        state.value = checkout(entity, next.type, prev.id);
        // After setting the state, "unwrap" the new revision data too, by swapping
        // it for all but the previous revision's state and unwatch callback, then
        // setting it to the linked reference. This obviates the need to unwrap the
        // value in every subsequent calls to `revise`, `append`, etc.
        const revision = revisions.get(state.value);
        revisions.set(linkedRef, revision);
      }
      if ([origRef?.[relationship], state.value, next].some(Array.isArray)) {
        if (!collections.has(linkedRef)) {
          const filter = next?.reduce((acc, { id, type }) => {
            const i = acc.findIndex(f => f.type === type);
            if (i < 0) return [...acc, { type, id: [id] }];
            const ids = acc[i]?.id || [];
            return [
              ...acc.slice(0, i),
              { type, id: [...ids, id] },
              ...acc.slice(i + 1),
            ];
          }, []) || [];
          const nextRef = checkoutCollection(entity, filter);
          state.value = nextRef;
          const collection = collections.get(nextRef);
          collections.set(state.value, collection);
        }
        ifMissing(next, prev, n => append(state.value, n.type, n));
        ifMissing(prev, next, p => drop(state.value, p.id));
      }
    };
    // To make sure the linkedRef gets updates whenever there are changes to the
    // corresponding resource identifiers in the origRef, a watcher must be set.
    let watcherIsSet = false;
    const setLinkWatcher = () => {
      const proxy = unref(origRef);
      // The original ref might be null or undefined initially, so check first.
      if (revisions.has(proxy) && relationship in proxy && !watcherIsSet) {
        const getter = () => proxy[relationship];
        linkWatchers.set(linkedRef, {
          watch: update,
          unwatch: watch(getter, update, { deep: true }),
        });
        update(proxy[relationship]);
        watcherIsSet = true;
      }
    };
    setLinkWatcher();
    // If the watcher can't be set right away, use watchEffect with the setter
    // as a callback, to watch all changes to the original ref as a whole.
    if (!watcherIsSet) watchEffect(setLinkWatcher);
    return linkedRef;
  }

  // Manually break the link between the original reference and the reference to
  // its related entity or entities, via Vue's `unwatch` handler:
  // https://vuejs.org/guide/essentials/watchers.html#stopping-a-watcher
  function unlink(reference) {
    const watcher = linkWatchers.get(reference);
    if (watcher && typeof watcher.unwatch === 'function') watcher.unwatch();
  }

  // A synchronous operation that updates the reference but does not persist
  // that update in the local database or send it to any remote. Instead, it
  // holds onto the transaction so it can be replayed by the commit function.
  function revise(reference, transaction) {
    let fields = {}; let tx = () => fields;
    if (typeof transaction === 'function') tx = transaction;
    if (is(Object, transaction)) fields = transaction;
    const { state, transactions, backupURI } = revisions.get(reference);
    fields = tx(reference);
    transactions.push(tx);
    backupTransactions(backupURI, fields);
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
      entity, type, id, queue, state, backupURI,
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
        clearBackup(backupURI);
        const syncOptions = { cache: asArray(next), filter: { id, type } };
        return syncEntities(shortName, syncOptions)
          .then(syncHandler(revision))
          .then(({ data: [value] = [] } = {}) => value);
      });
    });
  }

  return {
    add, append, checkout, commit, drop, link, revise, unlink,
  };
}
