import { anyPass, complement } from 'ramda';
import farm from '../farm';
import nomenclature from '../store/nomenclature';
import {
  deleteRecord, getRecords, saveRecord,
} from '.';
import { syncEntities } from '../http/sync';
import interceptor from '../http/interceptor';
import parseFilter from '../utils/parseFilter';
import daysAway from '../utils/daysAway';
import useRouter from '../store/useRouter';
import { STATUS_IN_PROGRESS, updateStatus } from '../store/connection';
import { alert } from '../store/alert';

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
  const meetsCriteria = anyPass([
    parseFilter(criteria),
    farm.meta.isUnsynced,
  ]);
  if (meetsCriteria(entity)) {
    return saveRecord('entities', name, entity)
      // b/c saveRecord just returns the uuid
      .then(() => entity);
  }
  return Promise.resolve(entity);
};

export const purgeCache = () => {
  const criteria = cachingCriteria();
  const meetsCriteria = name => complement(anyPass([
    parseFilter(criteria[name]),
    farm.meta.isUnsynced,
  ]));
  const dbRequests = Object.keys(nomenclature.entities)
    .map(name => deleteRecord('entities', name, meetsCriteria(name)));
  return Promise.all(dbRequests);
};

function syncHandler(evaluation) {
  const {
    loginRequired,
    connectivity,
    alerts,
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

export const syncCache = async () => {
  const now = new Date().toISOString();
  const settings = JSON.parse(LS.getItem('cacheSettings')) || {};
  const { lastSync } = settings;
  const requests = Object.values(nomenclature.entities).map(async ({ name, shortName }) => {
    const criteria = cachingCriteria({ now })[name];
    const changed = { $gt: lastSync };
    const filter = changed.$gt ? { ...criteria, changed } : criteria;
    const cache = await getRecords('entities', name);
    updateStatus(STATUS_IN_PROGRESS);
    const syncResults = await syncEntities(shortName, { filter, cache, limit: Infinity });
    const cacheRequests = syncResults.data.map(e => cacheEntity(name, e, criteria));
    const cacheResults = await Promise.allSettled(cacheRequests);
    const failedToCache = cacheResults.some(({ status }) => status === 'rejected');
    if (failedToCache) {
      cacheResults.forEach(({ status, reason }, i) => {
        if (status === 'rejected') {
          const data = syncResults.data[i];
          const error = new Error(
            `Error caching ${shortName} "${data.name}": ${reason.message}`,
            { cause: reason },
          );
          alert(error);
        }
      }, []);
    }
    return interceptor(syncResults, syncHandler);
  });
  return Promise.allSettled(requests).then(() => {
    const newSettings = { ...settings, lastSync: new Date().toISOString() };
    LS.setItem('cacheSettings', JSON.stringify(newSettings));
  });
};

export const refreshCache = () => syncCache().then(purgeCache);
