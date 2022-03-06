import {
  clientId, setHost, getToken, setToken,
} from '../remote';
import farm from '../farm';
import { loadFieldModule, fetchFieldModules } from '../fieldModules';
import router from '../router';
import { authInterceptor } from '../http/auth';

const LS = window.localStorage;

const initState = {
  errors: [],
  modules: [],
  mapboxAPIKey: '',
  areaGeoJSON: {
    type: 'FeatureCollection',
    features: [],
  },
};

const partitionResults = (sources, results) =>
  results.reduce(([fulfilled, rejected], result, i) => {
    if (result.status === 'fulfilled') {
      const ful = [...fulfilled, sources[i]];
      return [ful, rejected];
    }
    const rej = [sources[i], ...rejected];
    return [fulfilled, rej];
  }, [[], []]);
const loadModulesPlusHandler = (modules, commit) =>
  Promise.allSettled(modules.map(loadFieldModule))
    .then(results => partitionResults(modules, results))
    .then(([fullfilled, rejected]) => {
      commit('filterModules', mod => fullfilled.some(m => mod.name === m.name));
      rejected.forEach(({ label, uri }) => {
        commit('alert', new Error(`Error installing ${label} module from ${uri}.`));
      });
      return fullfilled;
    });

export default {
  state: initState,
  mutations: {
    alert(state, error) {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development') console.error(error);
      state.errors.push(authInterceptor(error, router));
    },
    dismissAlert(state, index) {
      state.errors.splice(index, 1);
    },
    updateModuleConfig(state, modConfig) {
      const i = state.modules.findIndex(m => m.name === modConfig.name);
      if (i >= 0) {
        state.modules.splice(i, 1, modConfig);
      } else {
        state.modules.push(modConfig);
      }
    },
    filterModules(state, predicate) {
      state.modules = state.modules.filter(predicate);
    },
  },
  actions: {
    authorize(_, { host, username, password }) {
      const remote = {
        host, clientId, getToken, setToken,
      };
      setHost(host);
      farm.remote.add(remote);
      return farm.remote.authorize(username, password);
    },
    loadFieldModules({ commit }) {
      const modules = JSON.parse(LS.getItem('modules')) || [];
      return loadModulesPlusHandler(modules, commit);
    },
    updateFieldModules({ commit }) {
      return fetchFieldModules().then((modules) => {
        LS.setItem('modules', JSON.stringify(modules));
        return loadModulesPlusHandler(modules, commit);
      });
    },
  },
};
