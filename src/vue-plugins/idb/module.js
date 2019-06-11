import makeLog from '@/utils/makeLog';
import {
  openDatabase,
  getRecords,
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
  equipStore,
] = config.stores;

export default {

  actions: {

    createCachedLog({ commit }, newLog) {
      const newRecord = makeLog.toIdb(newLog);
      openDatabase()
        .then(db => saveRecord(db, logStore.name, newRecord))
        .then(results => (
          // Can we be sure this will always be the CURRENT log?
          // Not if we use this action to add new records received from the server
          commit('updateCurrentLog', {
            local_id: results.insertId,
            isCachedLocally: true,
          })
        ));
    },

    // TODO: This is unnecessary duplication and should be removed.
    // This works like createCachedLog, but accepts params {log: , index: }
    createLogFromServer({ commit }, { index, log }) {
      const newRecord = makeLog.toIdb(log);
      openDatabase()
        .then(db => saveRecord(db, logStore.name, newRecord))
        .then((results) => {
          commit('updateLogFromServer', {
            index,
            log: makeLog.create({
              ...log,
              local_id: results.insertId,
              isCachedLocally: true,
            }),
          });
        });
    },

    loadCachedLogs({ commit }) {
      openDatabase()
        .then(db => getRecords(db, logStore.name))
        .then((results) => {
          const cachedLogs = results.map(log => (
            makeLog.create({
              ...log,
              isCachedLocally: true,
            })
          ));
          commit('addLogs', cachedLogs);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    updateCachedLog({ commit, rootState }, newProps) {
      const newLog = makeLog.toIdb({
        ...rootState.farm.logs[rootState.farm.currentLogIndex],
        ...newProps,
      });
      openDatabase()
        .then(db => saveRecord(db, logStore.name, newLog))
        // Can we be sure this will always be the CURRENT log?
        .then(() => commit('updateCurrentLog', {
          isCachedLocally: true,
        }));
    },

    // TODO: This is unnecessary duplication and should be removed.
    // This works like updateCachedLog, but accepts params {log: , index: }
    updateCachedLogAtIndex({ commit, rootState }, { log, index }) {
      const newLog = makeLog.toIdb({
        ...rootState.farm.logs[index],
        ...log,
      });
      openDatabase()
        .then(db => saveRecord(db, logStore.name, newLog))
        .then(() => commit('updateLogFromServer', {
          index,
          log: makeLog.create({
            ...log,
            isCachedLocally: true,
          }),
        }));
    },

    deleteCachedLog(_, { local_id }) { // eslint-disable-line camelcase
      openDatabase()
        .then(db => deleteRecord(db, logStore.name, local_id))
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
          commit('updateUnitsFromCache', results);
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
          commit('updateCategoriesFromCache', results);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    createCachedEquipment(_, newEquip) {
      openDatabase()
        .then(db => saveRecord(db, equipStore.name, newEquip))
        .catch(console.error); // eslint-disable-line no-console
    },

    // TODO: Remove duplication with createCachedEquipment
    updateCachedEquipment(context, equip) {
      openDatabase()
        .then(db => saveRecord(db, equipStore.name, equip))
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedEquipment() {
      openDatabase()
        .then(db => clearStore(db, equipStore.name))
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedEquipment({ commit }) {
      openDatabase()
        .then(db => getRecords(db, equipStore.name))
        .then((results) => {
          commit('addEquipment', results);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

  },
};
