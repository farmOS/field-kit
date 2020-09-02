// A Vuex module for modelling the attributes of the farm itself.

import { createLog, mergeLogFromServer, setLastSync } from '../../utils/farmLog';
import defaultResources from './defaultResources';
import { getRemoteLogs, sendRemoteLogs } from './http';
import createQuery from '../../utils/createQuery';
import farm from './farmClient';
import upsert from '../../utils/upsert';

// A factory function for generating adder mutations (eg, `addLogs`, etc).
const makeEntityAdder = (name, identifier) => (state, payload) => {
  if (Array.isArray(payload)) {
    payload.forEach(ent => upsert(state[name], identifier, ent));
  } else {
    upsert(state[name], identifier, payload);
  }
};

export default {
  state: {
    logs: [],
    assets: [],
    areas: [],
    units: [],
    categories: [],
    resources: defaultResources,
  },
  getters: {
    equipment(state) {
      return state.assets.filter(a => a.type === 'equipment');
    },
  },
  mutations: {
    addLogs: makeEntityAdder('logs', 'localID'),
    addAssets: makeEntityAdder('assets', 'id'),
    addAreas: makeEntityAdder('areas', 'tid'),
    addUnits: makeEntityAdder('units', 'tid'),
    addCategories: makeEntityAdder('categories', 'tid'),
    // This action is intended as the main API for field modules to modify log
    // properties. Among the props, localID is required.
    updateLog(state, { lastSync, ...props }) {
      const log = state.logs
        .find(l => l.localID === props.localID || +l.id === +props.id);
      if (log === undefined) {
        throw new Error('The updateLog action requires an id or localID among '
          + 'the props supplied as the payload. If the log does not have an id '
          + 'or localID yet, use the initializeLog action instead.');
      }
      Object.entries(props).forEach(([key, val]) => {
        if (log[key] !== val) {
          log[key] = val;
        }
      });
      if (lastSync) {
        const time = typeof lastSync === 'number' ? lastSync : undefined;
        setLastSync(log, time);
      }
    },
    filterLogs(state, predicate) {
      const filteredLogs = state.logs.filter(predicate);
      state.logs = filteredLogs;
    },
    mergeLogFromServer(state, serverLog) {
      const localLog = state.logs.find(log => +log.id === +serverLog.id);
      if (localLog) {
        mergeLogFromServer(localLog, serverLog);
      } else {
        state.logs.push(createLog(serverLog, Date.now()));
      }
    },
    deleteLog(state, localID) {
      const index = state.logs.findIndex(log => log.localID === localID);
      state.logs.splice(index, 1);
    },
    deleteAllLogs(state) {
      state.logs = [];
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
    setFarmResources(state, res) {
      state.resources = res;
    },
  },
  actions: {
    initializeLog({ commit, dispatch }, initProps = {}) {
      return new Promise((resolve, reject) => {
        dispatch('generateLogID').then((localID) => {
          // If the log is coming from the server, it will already have an id
          // and all its properties, so only needs to be updated w/ localID.
          const newLog = createLog({ ...initProps, localID });
          commit('addLogs', newLog);
          resolve(localID);
        }).catch(reject);
      });
    },
    loadLogs({ commit, dispatch }, { filter, pass }) {
      const query = createQuery(filter, pass);
      commit('filterLogs', query);
      return dispatch('loadCachedLogs', query);
    },
    getLogs(context, payload) {
      return context.dispatch('loadCachedLogs', payload)
        .then(() => getRemoteLogs(context, payload));
    },
    syncLogs(context, payload) {
      return context.dispatch('loadCachedLogs', payload)
        .then(() => getRemoteLogs(context, payload))
        .then(() => sendRemoteLogs(context, payload));
    },
    updateFarmResources({ commit, dispatch }, response) {
      const replaceResources = (res) => {
        if (res.resources) {
          commit('setFarmResources', res.resources);
          dispatch('cacheFarmResources', res.resources);
        }
        return res;
      };
      if (response) {
        return replaceResources(response);
      }
      return farm().info().then(replaceResources);
    },
    updateAreas({ commit }) {
      return farm().area.get().then((res) => {
        // If a successful response is received, delete and replace all areas
        commit('deleteAllAreas');
        const areas = res.list.map(({ tid, name, geofield }) => ({ tid, name, geofield }));
        commit('addAreas', areas);
      });
    },
    updateAssets({ commit }) {
      return farm().asset.get().then((res) => {
        // If a successful response is received, delete and replace all assets
        commit('deleteAllAssets');
        commit('addAssets', res.list);
      });
    },
    updateUnits({ commit }) {
      // Return units only.
      return farm().term.get('farm_quantity_units').then((res) => {
        commit('deleteAllUnits');
        const units = res.list.map(({ tid, name }) => ({ tid, name }));
        commit('addUnits', units);
      });
    },
    updateCategories({ commit }) {
      // Return categories only.
      return farm().term.get('farm_log_categories').then((res) => {
        commit('deleteAllCategories');
        const cats = res.list.map(({ tid, name }) => ({ tid, name }));
        commit('addCategories', cats);
      });
    },
  },
};
