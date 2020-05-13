import farmLog from '../../../utils/farmLog';
import {
  openDatabase,
  getRecords,
  generateLocalID,
  saveRecord,
  deleteRecord,
  clearStore,
} from './idb';
import config from './idb.config';

// Destructure the store configs so their names are easier to access
const [
  logStore,
  assetStore,
  areaStore,
  unitStore,
  catStore,
] = config.stores;

export default {

  actions: {

    updateCachedLog({ commit, rootState }, log) {
      openDatabase()
        .then(db => saveRecord(db, logStore.name, log))
        .then(() => {
          const { updateLog } = farmLog(rootState.shell.logTypes);
          const newLog = updateLog(log, { isCachedLocally: true });
          commit('addLogs', newLog);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedLogs({ commit, rootState }) {
      const { updateLog } = farmLog(rootState.shell.logTypes);
      const filters = rootState.shell.modules
        .filter(mod => mod.name === rootState.shell.currentModule)[0]?.filters.log;
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
        return applyFilter(type, type.includes(log.type.data))
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
      openDatabase()
        .then(db => getRecords(db, logStore.name, query))
        .then((results) => {
          const cachedLogs = results.map(log => (
            updateLog(log, { isCachedLocally: true })
          ));
          commit('addLogs', cachedLogs);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    // Specifically for loading logs for the Home screen widgets to use.
    loadHomeCachedLogs({ commit, rootState }) {
      const { updateLog } = farmLog(rootState.shell.logTypes);
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
      openDatabase()
        .then(db => getRecords(db, logStore.name, query))
        .then(() => {
          const cachedLogs = Object.values(results).flat().map(log => (
            updateLog(log, { isCachedLocally: true })
          ));
          commit('addLogs', cachedLogs);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    generateLogID() {
      return openDatabase()
        .then(db => generateLocalID(db, logStore.name))
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteCachedLog(_, localID) { // eslint-disable-line camelcase
      openDatabase()
        .then(db => deleteRecord(db, logStore.name, localID))
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedLogs() {
      openDatabase()
        .then(db => clearStore(db, logStore.name))
        .catch(console.error); // eslint-disable-line no-console
    },

    createCachedAsset(_, newAsset) {
      openDatabase()
        .then(db => saveRecord(db, assetStore.name, newAsset))
        .catch(console.error); // eslint-disable-line no-console
    },

    // TODO: Remove duplication with createCachedAsset
    updateCachedAsset(context, asset) {
      openDatabase()
        .then(db => saveRecord(db, assetStore.name, asset))
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedAssets() {
      openDatabase()
        .then(db => clearStore(db, assetStore.name))
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedAssets({ commit }) {
      openDatabase()
        .then(db => getRecords(db, assetStore.name))
        .then((results) => {
          commit('addAssets', results);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    createCachedArea(_, newArea) {
      openDatabase()
        .then(db => saveRecord(db, areaStore.name, newArea))
        .catch(console.error); // eslint-disable-line no-console
    },

    // TODO: Remove duplication with createCachedArea
    updateCachedArea(context, area) {
      openDatabase()
        .then(db => saveRecord(db, areaStore.name, area))
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedAreas() {
      openDatabase()
        .then(db => clearStore(db, areaStore.name))
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedAreas({ commit }) {
      openDatabase()
        .then(db => getRecords(db, areaStore.name))
        .then((results) => {
          commit('addAreas', results);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    createCachedUnit(_, newUnit) {
      openDatabase()
        .then(db => saveRecord(db, unitStore.name, newUnit))
        .catch(console.error); // eslint-disable-line no-console
    },

    // TODO: Remove duplication with createCachedUnit
    updateCachedUnit(context, unit) {
      openDatabase()
        .then(db => saveRecord(db, unitStore.name, unit))
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedUnits() {
      openDatabase()
        .then(db => clearStore(db, unitStore.name))
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedUnits({ commit }) {
      openDatabase()
        .then(db => getRecords(db, unitStore.name))
        .then((results) => {
          commit('addUnits', results);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    createCachedCategory(_, newCat) {
      openDatabase()
        .then(db => saveRecord(db, catStore.name, newCat))
        .catch(console.error); // eslint-disable-line no-console
    },

    // TODO: Remove duplication with createCachedCategory
    updateCachedCategory(context, cat) {
      openDatabase()
        .then(db => saveRecord(db, catStore.name, cat))
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedCategories() {
      openDatabase()
        .then(db => clearStore(db, catStore.name))
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedCategories({ commit }) {
      openDatabase()
        .then(db => getRecords(db, catStore.name))
        .then((results) => {
          commit('addCategories', results);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

  },
};
