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
import createQuery from '../../../utils/createQuery';
import { serializeLog, deserializeLog } from '../../../utils/farmLog';

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
      return saveRecord(logStore.name, serializeLog(log))
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedLogs({ commit }, payload) {
      const { filter: _filter, pass } = payload;
      const query = typeof payload === 'function'
        ? payload
        : createQuery(_filter, pass);
      return getRecords(logStore.name, query)
        .then((results) => {
          commit('addLogs', results.map(deserializeLog));
          return results;
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
      return getRecords(logStore.name, evictionCriteria(Date.now()))
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
