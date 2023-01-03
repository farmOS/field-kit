import { useRouter } from 'vue-router';
import { anyPass, complement, is } from 'ramda';
import farm from '../farm';
import nomenclature from '../entities/nomenclature';
import {
  deleteRecord, getRecords, saveRecord,
} from '.';
import { syncEntities } from '../http/sync';
import interceptor from '../http/interceptor';
import parseFilter from '../utils/parseFilter';
import daysAway from '../utils/daysAway';
import { STATUS_IN_PROGRESS, updateStatus } from '../http/connection';
import { alert } from '../warnings/alert';

const LS = window.localStorage;

const getUid = () => {
  const profile = JSON.parse(LS.getItem('profile')) || {};
  const { user: { id = '' } = {} } = profile;
  return id;
};

export const cachingCriteria = (options = {}) => {
  const { now = Date.now(), uid = getUid() } = options;
  return {
    asset: {
      status: 'active',
    },
    log: {
      timestamp: {
        $gt: daysAway(now, -30),
        $lt: daysAway(now, 15),
      },
    },
    plan: {},
    quantity: false,
    taxonomy_term: {},
    user: { id: uid },
  };
};

// These batches establish the order in which entities are synced and purged.
// Some entities (eg, quantities) depend upon others (eg, logs) to generate a
// passlist based on the latter's caching status and whether or not any of the
// former entities are related to it. So in the case of quantities, there are
// too many to just cache them all (unlike terms), but no criteria in the entity
// data itself, such as a timestamp, upon which to judge if it should be cached.
// A quantity's status is contingent on whether any logs have already been
// cached that reference the quantity in its `quantity` relationship field. So
// as logs are being cached or purged in the first batch, their `quantity` field
// is checked for any quantities
const batches = [[
  'asset',
  'log',
  'plan',
  'taxonomy_term',
  'user',
], [
  'quantity',
]];
// Each passlist is a Map from an entity's id (UUID) to a Set of id's for any
// other entity that depends upon it. Empty sets will be deleted, so whether or
// not an entity is the dependency of another entity (or several others) can be
// determined, as in isDependency() below simply by calling Map.prototype.has().
const passlists = {
  quantity: new Map(),
};
// A collection of mappings from the relationship field of a higher order batch,
// to the entity name of a lower order batch the former's field depends on.
const dependencyLists = {
  log: new Map([
    // relationship => entity name
    ['quantity', 'quantity'],
  ]),
};

function listDependencies(name, entity) {
  const dependencies = dependencyLists[name];
  if (is(Map, dependencies)) {
    dependencies.forEach((depName, relationship) => {
      const list = passlists[depName];
      const add = (dep) => {
        if (!list.has(dep.id)) list.set(dep.id, new Set());
        const set = list.get(dep.id);
        set.add(entity.id);
      };
      const field = entity?.relationships?.[relationship];
      if (Array.isArray(field)) field.forEach(add);
      if (field.id) add(field);
    });
  }
}

const unlistDependencies = name => (results) => {
  const dependencies = dependencyLists[name];
  if (!is(Map, dependencies)) return results;
  const { deleted = [] } = results;
  deleted.forEach((entity) => {
    dependencies.forEach((depName, relationship) => {
      const list = passlists[depName];
      const remove = (dep) => {
        const set = list.get(dep.id);
        set?.delete(entity.id);
        if (set.size <= 0) list.delete(dep.id);
      };
      const field = entity?.relationships?.[relationship];
      if (Array.isArray(field)) field.forEach(remove);
      if (field.id) remove(field);
    });
  });
  return results;
};

const isDependency = name => (entity) => {
  if (name in passlists) return passlists[name].has(entity.id);
  return false;
};

export const cacheEntity = (name, entity, options) => {
  const criteria = cachingCriteria(options)[name];
  const meetsCriteria = anyPass([
    parseFilter(criteria),
    isDependency(name),
    farm.meta.isUnsynced,
  ]);
  if (meetsCriteria(entity)) {
    listDependencies(name, entity);
    return saveRecord('entities', name, entity)
      // b/c saveRecord just returns the uuid
      .then(() => entity);
  }
  return Promise.resolve(entity);
};

const purgeCache = (batch) => {
  const criteria = cachingCriteria();
  const meetsCriteria = name => complement(anyPass([
    parseFilter(criteria[name]),
    isDependency(name),
    farm.meta.isUnsynced,
  ]));
  return Promise.all(batch.map(name =>
    deleteRecord('entities', name, meetsCriteria(name))
      .then(unlistDependencies(name))));
};

function syncHandler(evaluation) {
  const {
    loginRequired, connectivity, alerts,
  } = evaluation;
  updateStatus(connectivity);
  if (alerts.length > 0) alert(alerts);
  if (loginRequired) useRouter().push('/login');
}

// A batch of one or more entities, listed by name, is synced in parallel via
// Promise.allSettled. First, the cache is checked for any prexisting records,
// then a sync request is made that merges and caches any remote results.
const syncCache = async (batch) => {
  const now = new Date().toISOString();
  const settings = JSON.parse(LS.getItem('cacheSettings')) || {};
  const { lastSync } = settings;
  const requests = batch.map(async (name) => {
    const { shortName } = nomenclature.entities[name];
    const criteria = cachingCriteria({ now })[name];
    const changed = { $gt: lastSync };
    const filter = changed.$gt ? { ...criteria, changed } : criteria;
    const cache = await getRecords('entities', name, parseFilter(criteria));
    updateStatus(STATUS_IN_PROGRESS);
    const syncResults = await syncEntities(shortName, { filter, cache, limit: Infinity });
    const cacheRequests = syncResults.data.map(d => cacheEntity(name, d, criteria));
    const cacheResults = await Promise.allSettled(cacheRequests);
    cacheResults.forEach(({ status, reason }, i) => {
      if (status === 'rejected') {
        let label = syncResults.data[i]?.name || syncResults.data[i]?.label;
        label = label ? ` "${label}" ` : '';
        const msg = `Error caching ${shortName}${label}: ${reason.message}`;
        alert(new Error(msg, { cause: reason }));
      }
    });
    return interceptor(syncHandler, syncResults);
  });
  return Promise.allSettled(requests).then(() => {
    const newSettings = { ...settings, lastSync: new Date().toISOString() };
    LS.setItem('cacheSettings', JSON.stringify(newSettings));
  });
};

const refresh = ([head, ...tail]) => syncCache(head)
  .then(() => purgeCache(head))
  .then(result => (tail.length > 0 ? refresh(tail) : result));

export const refreshCache = () => refresh(batches);
