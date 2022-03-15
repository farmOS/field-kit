import { syncEntities } from './sync';
import interceptor from './interceptor';
import { getRecords } from '../idb';
import { cacheEntity } from '../idb/cache';
import farm from '../farm';
import nomenclature from '../store/nomenclature';
import { STATUS_IN_PROGRESS, updateStatus } from '../store/connection';
import { alert } from '../store/alert';
import parseFilter from '../utils/parseFilter';

// An array of shortNames to ensure only valid entities are pushed onto the scheduler.
const entities = Object.keys(nomenclature.entities);

const stringifyID = (entity, type, id) => JSON.stringify({ entity, type, id });
const parseID = string => JSON.parse(string);
const FILTER_ID = 'FILTER_ID';

function groupFilters(setOfPendingEntities, mapOfPendingFilters) {
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
    if (id === FILTER_ID && mapOfPendingFilters.has(idString)) {
      const pendingFilter = mapOfPendingFilters.get(idString);
      filter = { ...pendingFilter, type, id: filter.id };
      filters.set(type, filter);
    } else {
      filter.id.push(id);
    }
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

export default function SyncScheduler(intervals = defaultIntervals) {
  const pending = new Set();
  const listeners = new Map();
  const pendingFilters = new Map();

  async function retry() {
    const retrying = new Set(pending);
    pending.clear();
    const retryingFilters = new Map(pendingFilters);
    pendingFilters.clear();
    const filterGroups = groupFilters(retrying, retryingFilters);
    const requests = filterGroups.map(async (group) => {
      updateStatus(STATUS_IN_PROGRESS);
      const { entity, filter } = group;
      const { shortName } = nomenclature.entities[entity];
      const query = parseFilter(filter);
      const cache = await getRecords('entities', entity, query);
      const results = await syncEntities(shortName, { cache, filter });
      const handler = ({ connectivity, warnings }) => {
        updateStatus(connectivity);
        if (warnings.length > 0) {
          alert(warnings);
        }
      };
      const { data } = interceptor(handler, results);
      data.forEach((value) => {
        const clearById = (retryList, idString) => {
          retryList.delete(idString);
          // Use optional chaining in case the exact id was never scheduled, or
          // an earlier retry already deleted it.
          listeners.get(idString)?.forEach((listener) => {
            safeCall(listener, value);
          });
          listeners.delete(idString);
        };
        if (!farm.meta.isUnsynced(value)) {
          const { type, id } = value;
          const idString = stringifyID(entity, type, id);
          clearById(retrying, idString);
          // Assume that if a value of a given type succeeds, any corresponding
          // filters with that same type also completed and can be cleared.
          const filterIdString = stringifyID(entity, type, FILTER_ID);
          clearById(retryingFilters, filterIdString);
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

  this.push = function push(entity, type, target) {
    if (!entities.includes(entity)) {
      throw new Error(`Invalid entity name: ${entity}`);
    }
    const id = typeof target === 'string' ? target : FILTER_ID;
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
