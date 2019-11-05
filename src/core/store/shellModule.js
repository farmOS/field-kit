// A Vuex module for holding state for the application shell.

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
    currentModule: '',
    modules: [],
    mapboxAPIKey: '',
    settings: {
      useGeolocation: true,
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
    setLoginStatus(state, bool) {
      state.user.isLoggedIn = bool;
    },
    setUseGeolocation(state, bool) {
      state.settings.useGeolocation = bool;
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
};
