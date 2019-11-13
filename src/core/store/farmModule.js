// A Vuex module for modelling the attributes of the farm itself.

import makeLog from '../../utils/makeLog';

const makeEntityAdder = (name, identifier) => (state, entities) => {
  if (Array.isArray(entities)) {
    const unique = entities
      .filter(x => !state[name].some(y => x[identifier] === y[identifier]));
    state[name] = state[name].concat(unique);
  } else if (!state[name].some(area => area[identifier] === entities[identifier])) {
    state[name] = state[name].concat(entities);
  }
};

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
    addLogs: makeEntityAdder('logs', 'localID'),
    addAssets: makeEntityAdder('assets', 'id'),
    addAreas: makeEntityAdder('areas', 'tid'),
    addUnits: makeEntityAdder('units', 'tid'),
    addCategories: makeEntityAdder('categories', 'tid'),
    addEquipment: makeEntityAdder('equipment', 'id'),
    updateLog(state, payload) {
      const { props } = payload;
      const index = payload.index !== undefined
        ? payload.index
        : state.logs.findIndex(log => log.localID === props.localID);
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
    filterLogs(state, predicate) {
      const filteredLogs = state.logs.filter(predicate);
      state.logs = filteredLogs;
    },
  },
  actions: {
    initializeLog({ commit, dispatch, rootState }, initProps) {
      const modules = initProps.modules || [rootState.shell.currentModule];
      return new Promise((resolve, reject) => {
        dispatch('generateLogID').then((localID) => {
          const newLog = makeLog.create({ ...initProps, localID, modules });
          commit('addLogs', newLog);
          resolve(localID);
        }).catch(reject);
      });
    },
  },
};
