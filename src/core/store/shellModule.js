// A Vuex module for holding state for the application shell.
import farm from './farmClient';
import { createFieldModule, loadFieldModule, setRootRoute } from '../../utils/fieldModules';

export default {
  state: {
    errors: [],
    user: {
      name: '',
      email: '',
      uid: null,
      isLoggedIn: false,
    },
    farmInfo: {
      name: '',
      url: '',
    },
    systemOfMeasurement: 'metric',
    currentModule: '',
    modules: [],
    mapboxAPIKey: '',
    settings: {
      useGeolocation: true,
    },
    areaGeoJSON: {
      type: 'FeatureCollection',
      features: [],
    },
  },
  mutations: {
    logError(state, error) {
      state.errors = state.errors.concat([error]);
    },
    dismissError(state, index) {
      const updatedError = {
        ...state.errors[index],
        show: false,
      };
      state.errors.splice(index, 1, updatedError);
    },
    changeUsername(state, name) {
      state.user.name = name;
    },
    changeEmail(state, email) {
      state.user.email = email;
    },
    changeUid(state, uid) {
      state.user.uid = uid;
    },
    changeFarmName(state, name) {
      state.farmInfo.name = name;
    },
    changeFarmUrl(state, url) {
      state.farmInfo.url = url;
    },
    changeMapboxAPIKey(state, key) {
      state.mapboxAPIKey = key;
    },
    changeSystemOfMeasurement(state, name) {
      state.systemOfMeasurement = name;
    },
    setLoginStatus(state, bool) {
      state.user.isLoggedIn = bool;
    },
    setUseGeolocation(state, bool) {
      state.settings.useGeolocation = bool;
    },
    setAreaGeoJSON(state, geojson) {
      state.areaGeoJSON = geojson;
    },
    updateModule(state, module) {
      const matchIndex = state.modules.findIndex(mod => mod.name === module.name);
      if (matchIndex > -1) {
        state.modules.splice(matchIndex, 1, module);
      } else {
        state.modules.push(module);
      }
    },
    setCurrentModule(state, module) {
      state.currentModule = module;
    },
  },
  actions: {
    updateFieldModules({ rootState, commit, dispatch }, router) {
      const deps = {
        state: rootState,
        commit,
        dispatch,
        router,
      };

      // Overwrite the mounting function so it has the most recent state.
      window.farmOS.mountFieldModule = mod => createFieldModule(mod, deps);

      return farm().info()
        .then((res) => {
          if (res?.client?.modules) {
            Object.values(res.client.modules).forEach(loadFieldModule);
            localStorage.setItem('modules', JSON.stringify(res.client.modules));
          }
          setRootRoute(res?.client?.modules, router);
          return res;
        })
        // If the request fails, we can still load modules from cache.
        .catch(() => {
          const modules = JSON.parse(localStorage.getItem('modules'));
          if (modules) {
            Object.values(modules).forEach(loadFieldModule);
          }
          setRootRoute(modules, router);
        });
    },
  },
};
