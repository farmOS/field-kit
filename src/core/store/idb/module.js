import {
  getAllKeys,
  getRecords,
  generateLocalID,
  count,
  saveRecord,
  deleteRecord,
  clearStore,
} from './idb';
import config from './idb.config';
import { evictionCriteria } from './criteria';

// Destructure the store configs so their names are easier to access
const [
  logStore,
  assetStore,
  areaStore,
  unitStore,
  catStore,
  resStore,
] = config.stores;

export default {

  actions: {

    updateCachedLog(_, log) {
      return saveRecord(logStore.name, log)
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedLogs({ commit, rootState }) {
      const filters = rootState.shell.modules
        .filter(mod => mod.name === rootState.shell.currentModule)[0]?.filters?.log;
      const query = (log) => {
        // Return early and add this log if it belongs to the module.
        const isMatchingModule = log.modules?.includes(rootState.shell.currentModule);
        if (isMatchingModule) {
          return true;
        }
        // Don't add the log if no filters are provided.
        if (!filters) {
          return false;
        }
        // Otherwise check that the log satisfies each field's filter, if provided.
        const {
          type, done, log_owner, area, asset, log_category, // eslint-disable-line camelcase
        } = filters;
        // The next two functions keep things a little more DRY, but also ensure
        // lazy evaluation so filters will not be applied needlessly.
        const applyFilter = (filter, ...conditions) => (filter === undefined)
          || conditions.every(condition => condition);
        const applyEntityFilter = (filter, refs, entities, identifier) => (Array.isArray(filter)
          ? filter.includes(refs.map(r => r.id))
          : entities
            .filter(e => refs.some(r => r.id === e[identifier]))
            .some(filter));
        return applyFilter(type, type?.includes(log.type.data))
          && applyFilter(done, log.done.data === !!done)
          && applyFilter(log_owner,
            log.log_owner.data.some(owner => +owner.id === +filters.log_owner))
          && applyFilter(area,
            applyEntityFilter(area, log.area.data, rootState.farm.areas, 'tid'))
          && applyFilter(asset,
            applyEntityFilter(asset, log.asset.data, rootState.farm.assets, 'id'))
          && applyFilter(log_category,
            applyEntityFilter(log_category, log.log_category.data, rootState.farm.categories, 'tid'));
      };
      return getRecords(logStore.name, query)
        .then((results) => {
          commit('addLogs', results);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    // Specifically for loading logs for the Home screen widgets to use.
    loadHomeCachedLogs({ commit, rootState }) {
      // We're going to build our own object to store arrays of results for each
      // module, and discard the result returned by getRecords. We won't worry
      // about duplicates across modules because the addLogs mutation doesn't
      // add duplicates (by localID). The initial results object will look like:
      // {
      //   'my-logs': [],
      //   precipitation: [],
      //   // etc...
      // }
      const results = rootState.shell.modules
        .reduce((acc, cur) => ({ ...acc, [cur.name]: [] }), {});
      // Store the present time in a constant, which will be the same for
      // every iteration of the .sort() function.
      const present = Math.floor(Date.now() / 1000);
      const compare = (a, b) => {
        // Log A's possible states.
        const aIsLate = !a.done.data && a.timestamp.data < present;
        const aIsUpcoming = !a.done.data && a.timestamp.data > present;
        const aIsDone = a.done.data;

        // Log B's possible states.
        const bIsLate = !b.done.data && b.timestamp.data < present;
        const bIsUpcoming = !b.done.data && b.timestamp.data > present;
        const bIsDone = b.done.data;

        // Getters for return values, which will determine how A and B are
        // sorted relative to each other.
        const sortAscending = () => a.timestamp.data - b.timestamp.data;
        const sortDescending = () => b.timestamp.data - a.timestamp.data;
        const aBeforeB = () => -1;
        const bBeforeA = () => 1;

        if (aIsLate && bIsLate) {
          return sortAscending();
        }
        if (aIsLate && bIsUpcoming) {
          return aBeforeB();
        }
        if (aIsLate && bIsDone) {
          return aBeforeB();
        }
        if (aIsUpcoming && bIsLate) {
          return bBeforeA();
        }
        if (aIsUpcoming && bIsUpcoming) {
          return sortAscending();
        }
        if (aIsUpcoming && bIsDone) {
          return aBeforeB();
        }
        if (aIsDone && bIsLate) {
          return bBeforeA();
        }
        if (aIsDone && bIsUpcoming) {
          return bBeforeA();
        }
        if (aIsDone && bIsDone) {
          return sortDescending();
        }
        return 0;
      };
      const query = (log) => {
        rootState.shell.modules.forEach((mod) => {
          if (log.modules.includes(mod.name)) {
            results[mod.name].push(log);
            results[mod.name].sort(compare);
            if (results[mod.name].length > 10) {
              results[mod.name].pop();
            }
          }
          // Always return false, because we're not using these results.
          return false;
        });
      };
      return getRecords(logStore.name, query)
        .then(() => {
          const cachedLogs = Object.values(results).flat();
          commit('addLogs', cachedLogs);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    generateLogID() {
      return generateLocalID(logStore.name)
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteCachedLog(_, localID) { // eslint-disable-line camelcase
      return deleteRecord(logStore.name, localID)
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedLogs() {
      return clearStore(logStore.name)
        .catch(console.error); // eslint-disable-line no-console
    },

    countCachedLogs(_, query) {
      return count(logStore.name, query)
        .catch(console.error); // eslint-disable-line no-console
    },

    purgeLogs() {
      return getRecords(logStore.name, evictionCriteria(Math.floor(Date.now() / 1000)))
        .then(results => Promise.all(
          results.map(({ localID }) => deleteRecord(logStore.name, localID)),
        ))
        .catch(console.error); // eslint-disable-line no-console
    },

    createCachedAsset(_, newAsset) {
      return saveRecord(assetStore.name, newAsset)
        .catch(console.error); // eslint-disable-line no-console
    },

    // TODO: Remove duplication with createCachedAsset
    updateCachedAsset(context, asset) {
      return saveRecord(assetStore.name, asset)
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedAssets() {
      return clearStore(assetStore.name)
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedAssets({ commit }) {
      return getRecords(assetStore.name)
        .then((results) => {
          commit('addAssets', results);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    createCachedArea(_, newArea) {
      return saveRecord(areaStore.name, newArea)
        .catch(console.error); // eslint-disable-line no-console
    },

    // TODO: Remove duplication with createCachedArea
    updateCachedArea(context, area) {
      return saveRecord(areaStore.name, area)
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedAreas() {
      return clearStore(areaStore.name)
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedAreas({ commit }) {
      return getRecords(areaStore.name)
        .then((results) => {
          commit('addAreas', results);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    createCachedUnit(_, newUnit) {
      return saveRecord(unitStore.name, newUnit)
        .catch(console.error); // eslint-disable-line no-console
    },

    // TODO: Remove duplication with createCachedUnit
    updateCachedUnit(context, unit) {
      return saveRecord(unitStore.name, unit)
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedUnits() {
      return clearStore(unitStore.name)
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedUnits({ commit }) {
      return getRecords(unitStore.name)
        .then((results) => {
          commit('addUnits', results);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    createCachedCategory(_, newCat) {
      return saveRecord(catStore.name, newCat)
        .catch(console.error); // eslint-disable-line no-console
    },

    // TODO: Remove duplication with createCachedCategory
    updateCachedCategory(context, cat) {
      return saveRecord(catStore.name, cat)
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedCategories() {
      return clearStore(catStore.name)
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedCategories({ commit }) {
      return getRecords(catStore.name)
        .then((results) => {
          commit('addCategories', results);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    cacheFarmResources(_, resources) {
      return Promise.all(Object.entries(resources)
        .map(([key, resource]) => saveRecord(resStore.name, resource, key)
          .catch(console.error))); // eslint-disable-line no-console
    },

    loadCachedResources({ commit }) {
      return getAllKeys(resStore.name)
        .then(keys => getRecords(resStore.name, keys))
        .then((results) => {
          if (Object.keys(results).length > 0) {
            commit('setFarmResources', results);
          }
        })
        .catch(console.error); // eslint-disable-line no-console
    },
  },
};
