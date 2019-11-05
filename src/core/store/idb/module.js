import makeLog from '@/utils/makeLog';
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
  equipStore,
] = config.stores;

export default {

  actions: {

    createCachedLog({ commit }, newLog) {
      const newRecord = makeLog.toIdb(newLog);
      openDatabase()
        .then(db => saveRecord(db, logStore.name, newRecord))
        .then(() => (
          commit('updateLog', {
            props: {
              local_id: newLog.local_id,
              isCachedLocally: true,
            },
          })
        ))
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedLogs({ commit, getters, rootState }) {
      const filters = getters.logFilters;
      const query = (log) => {
        let passesAllFilters;
        if (filters === null) {
          passesAllFilters = false;
        } else {
          const { type, done } = filters;
          const passesOwnerFilter = filters.log_owner === undefined
            || log.log_owner.data.length === 0
            || log.log_owner.data.some(owner => +owner.id === +filters.log_owner);
          const passesTypeFilter = type === undefined || type.includes(log.type.data);
          const passesDoneFilter = done === undefined || log.done.data === !!done;
          passesAllFilters = passesOwnerFilter && passesTypeFilter && passesDoneFilter;
        }
        const isMatchingModule = !log.modules
          ? false
          : log.modules.includes(rootState.shell.currentModule);
        return isMatchingModule || passesAllFilters;
      };
      openDatabase()
        .then(db => getRecords(db, logStore.name, query))
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

    generateLogID() {
      return openDatabase()
        .then(db => generateLocalID(db, logStore.name))
        .catch(console.error); // eslint-disable-line no-console
    },

    updateCachedLog({ commit, rootState }, payload) {
      const { props } = payload;
      const index = payload.index !== undefined
        ? payload.index
        : rootState.farm.logs.findIndex(log => log.local_id === props.local_id);
      const newLog = makeLog.toIdb({
        ...rootState.farm.logs[index],
        ...props,
      });
      openDatabase()
        .then(db => saveRecord(db, logStore.name, newLog))
        .then(key => commit('updateLog', {
          index,
          props: {
            isCachedLocally: true,
            local_id: key,
          },
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
