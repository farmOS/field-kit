import {
  clientId, setHost, getToken, setToken,
} from '../remote';
import farm from '../farm';
import { loadFieldModule, fetchFieldModules } from '../fieldModules';
import router from '../router';
import { authInterceptor } from '../http/auth';

const LS = window.localStorage;

const defaultProfile = {
  farm: {
    name: '',
    url: '',
    version: '',
    system_of_measurement: '',
  },
  user: {
    id: '',
    display_name: '',
    langcode: 'en',
  },
};

const initState = {
  errors: [],
  profile: defaultProfile,
  modules: [],
  mapboxAPIKey: '',
  settings: {
    useGeolocation: true,
  },
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
    setProfile(state, profile = {}) {
      const { farm: farmInfo = {}, user = {} } = profile;
      state.profile = {
        farm: {
          ...state.profile.farm,
          ...farmInfo,
        },
        user: {
          ...state.profile.user,
          ...user,
        },
      };
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
    loadProfile({ commit }) {
      const profile = JSON.parse(LS.getItem('profile'));
      if (profile) {
        commit('setProfile', profile);
        return Promise.resolve(profile);
      }
      return Promise.reject(new Error('No profile cached, login required.'));
    },
    updateProfile({ state, commit, dispatch }) {
      return farm.remote.info()
        .then((info) => {
          const farmInfo = info.data?.meta?.farm;
          const user = info.data?.meta?.links?.me?.meta;
          if (farmInfo && user) {
            commit('setProfile', { farm: farmInfo, user });
            return dispatch('fetchEntities', { name: 'user', filter: { type: 'user', id: user.id } });
          }
          return Promise.reject(new Error('Cannot find remote profile info.'));
        })
        .then((results) => {
          const { attributes: { display_name, langcode } } = results.data[0];
          commit('setProfile', { user: { display_name, langcode } });
          LS.setItem('profile', JSON.stringify(state.profile));
          return state.profile;
        });
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
