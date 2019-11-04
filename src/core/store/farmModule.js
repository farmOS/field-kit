// A Vuex module for modelling the attributes of the farm itself.

import makeLog from '../../utils/makeLog';

export default {
  state: {
    logs: [],
    assets: [],
    areas: [],
    units: [],
    categories: [],
    equipment: [],
  },
  mutations: {
    addLogs(state, logs) {
      if (Array.isArray(logs)) {
        const uniqueLogs = logs
          .filter(log1 => !state.logs.some(log2 => log1.local_id === log2.local_id));
        state.logs = state.logs.concat(uniqueLogs);
      } else if (!state.logs.some(log => log.local_id === logs.local_id)) {
        state.logs = state.logs.concat(logs);
      }
    },
    addAssets(state, assets) {
      state.assets = state.assets.concat(assets);
    },
    addAreas(state, areas) {
      state.areas = state.areas.concat(areas);
    },
    addUnits(state, units) {
      state.units = state.units.concat(units);
    },
    addCategories(state, cats) {
      state.categories = state.categories.concat(cats);
    },
    addEquipment(state, equip) {
      state.equipment = state.equipment.concat(equip);
    },
    updateLog(state, payload) {
      const { props } = payload;
      const index = payload.index !== undefined
        ? payload.index
        : state.logs.findIndex(log => log.local_id === props.local_id);
      const updatedLog = makeLog.create({
        ...state.logs[index],
        ...props,
      });
      state.logs.splice(index, 1, updatedLog);
    },
    // Takes a function as payload and applies it to each log object
    updateAllLogs(state, fn) {
      state.logs = state.logs.map(log => fn(log));
    },
    deleteLog(state, { index }) {
      state.logs.splice(index, 1);
    },
    deleteAllAssets(state) {
      state.assets = [];
    },
    deleteAllAreas(state) {
      state.areas = [];
    },
    deleteAllUnits(state) {
      state.units = [];
    },
    deleteAllCategories(state) {
      state.categories = [];
    },
    deleteAllEquipment(state) {
      state.equipment = [];
    },
    // ClearX followed by loadCachedX are called when the app loads
    // clearX is NOT a hook, and do not trigger deletion in the DB
    // in contrast, deleteAllX is a hook which calls deleteAllCachedX in the db
    clearLogs(state) {
      state.logs.splice(0, state.logs.length);
    },
    clearAssets(state) {
      state.assets.splice(0, state.assets.length);
    },
    clearAreas(state) {
      state.areas.splice(0, state.areas.length);
    },
    clearUnits(state) {
      state.units.splice(0, state.units.length);
    },
    clearCategories(state) {
      state.categories.splice(0, state.categories.length);
    },
    clearEquipment(state) {
      state.equipment.splice(0, state.equipment.length);
    },
  },
  actions: {
    initializeLog({ commit, dispatch }, initProps) {
      return new Promise((resolve, reject) => {
        dispatch('generateLogID').then((local_id) => { // eslint-disable-line camelcase
          const newLog = makeLog.create({ ...initProps, local_id });
          commit('addLogs', newLog);
          resolve(local_id);
        }).catch(reject);
      });
    },
  },
};
