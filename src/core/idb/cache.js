import {
  anyPass, complement, compose,
} from 'ramda';
import farm from '../farm';
import nomenclature from '../store/nomenclature';
import {
  deleteRecord, getRecords, saveRecord,
} from '.';
import syncEntity from '../http/sync';
import parseFilter from '../utils/parseFilter';
import flattenEntity from '../utils/flattenEntity';
import daysAway from '../utils/daysAway';
import SyncError from '../http/SyncError';

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
    quantity: {},
    taxonomy_term: {},
    user: { id: uid },
  };
};

export const cacheEntity = (name, entity, options) => {
  const criteria = cachingCriteria(options)[name];
  const meetsCriteria = compose(
    anyPass([
      parseFilter(criteria),
      farm.meta.isUnsynced,
    ]),
    flattenEntity,
  );
  if (meetsCriteria(entity)) {
    return saveRecord('entities', name, entity);
  }
  return Promise.resolve(entity);
};

export const purgeCache = () => {
  const criteria = cachingCriteria();
  const meetsCriteria = name => compose(
    complement(anyPass([
      parseFilter(criteria[name]),
      farm.meta.isUnsynced,
    ])),
    flattenEntity,
  );
  const dbRequests = Object.keys(nomenclature.entities)
    .map(name => deleteRecord('entities', name, meetsCriteria(name)));
  return Promise.all(dbRequests);
};

export const syncCache = async () => {
  const now = new Date().toISOString();
  const settings = JSON.parse(LS.getItem('cacheSettings')) || {};
  const { lastSync } = settings;
  const requests = Object.values(nomenclature.entities).map(async ({ name, shortName }) => {
    const criteria = cachingCriteria({ now })[name];
    const filter = lastSync ? { ...criteria, changed: lastSync } : criteria;
    const cache = await getRecords('entities', name);
    const syncResults = await syncEntity(shortName, { filter, cache, limit: Infinity });
    const cacheRequests = syncResults.data.map(e => cacheEntity(name, e, criteria));
    const cacheResults = await Promise.allSettled(cacheRequests);
    const failedToCache = cacheResults.some(({ status }) => status === 'rejected');
    if (syncResults.rejected.length === 0 && !failedToCache) {
      return syncResults;
    }
    if (syncResults.rejected.length > 0 && !failedToCache) {
      throw new SyncError(syncResults);
    }
    const cacheFailures = cacheResults.reduce((rejected, { status, reason }, i) => {
      if (status !== 'rejected') return rejected;
      const data = syncResults.data[i];
      return rejected.concat({ reason, data });
    }, []);
    throw new SyncError({
      ...syncResults,
      rejected: syncResults.rejected.concat(cacheFailures),
    });
  });
  return Promise.allSettled(requests).then(() => {
    const newSettings = { ...settings, lastSync: new Date().toISOString() };
    LS.setItem('cacheSettings', JSON.stringify(newSettings));
  });
};

export const refreshCache = () => syncCache().then(purgeCache);
