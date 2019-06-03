import makeLog from '@/utils/makeLog';

export default {

  actions: {

    createCachedLog({ commit }, newLog) {
      // do something
    },

    // This works like createCachedLog, but accepts params {log: , index: }
    createLogFromServer({ commit }, props) {
      // do something
    },

    loadCachedLogs({ commit }) {
      // do something
    },

    updateCachedLog({ commit, rootState }, newProps) {
      // do something
    },

    // This works like updateCachedLog, but accepts params {log: , index: }
    updateCachedLogAtIndex({ commit, rootState }, props) {
      // do something
    },

    deleteCachedLog(_, { local_id }) { // eslint-disable-line camelcase
      // do something
    },

    deleteAllCachedLogs() {
      // do something
    },

    createCachedAsset(_, newAsset) {
      // do something
    },

    updateCachedAsset(context, asset) {
      // do something
    },

    deleteAllCachedAssets() {
      // do something
    },

    loadCachedAssets({ commit }) {
      // do something
    },

    createCachedArea(_, newArea) {
      // do something
    },

    updateCachedArea(context, area) {
      // do something
    },

    deleteAllCachedAreas() {
      // do something
    },

    loadCachedAreas({ commit }) {
      // do something
    },

    createCachedUnit(_, newUnit) {
      // do something
    },

    updateCachedUnit(context, unit) {
      // do something
    },

    deleteAllCachedUnits() {
      // do something
    },

    loadCachedUnits({ commit }) {
      // do something
    },

    createCachedCategory(_, newCat) {
      // do something
    },

    updateCachedCategory(context, cat) {
      // do something
    },

    deleteAllCachedCategories() {
      // do something
    },

    loadCachedCategories({ commit }) {
      // do something
    },

    createCachedEquipment(_, newEquip) {
      // do something
    },

    updateCachedEquipment(context, equip) {
      // do something
    },

    deleteAllCachedEquipment() {
      // do something
    },

    loadCachedEquipment({ commit }) {
      // do something
    },

  },
};
