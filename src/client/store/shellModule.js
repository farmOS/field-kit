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
    mapboxAPIKey: '',
    settings: {
      useGeolocation: true,
      // search parameters for getting logs from the server.  Log_owner set when user.uid is set
      logImportFilters: {
        log_owner: null,
        done: '0',
        type: ['farm_activity', 'farm_observation', 'farm_harvest', 'farm_input', 'farm_seeding'],
      },
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
      state.settings.logImportFilters.log_owner = uid;
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
  },
};
