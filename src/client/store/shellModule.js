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
      logDisplayFilters: {
        date: 'ALL_TIME',
        // NOTE: We're tracking which types/categories to EXCLUDE, so we can manage
        // defaults more easily w/o having to poll the server for the list
        excludeTypes: [],
        excludeCategories: [],
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
    addToExcludeTypes(state, type) {
      const newArr = state.settings.logDisplayFilters.excludeTypes.concat(type);
      state.settings.logDisplayFilters.excludeTypes = newArr;
      localStorage.setItem('excludeTypes', JSON.stringify(newArr));
    },
    removeFromExcludeTypes(state, type) {
      const newArr = state.settings.logDisplayFilters.excludeTypes.filter(_type => (
        type !== _type
      ));
      state.settings.logDisplayFilters.excludeTypes = newArr;
      localStorage.setItem('excludeTypes', JSON.stringify(newArr));
    },
    addToExcludeCategories(state, cat) {
      const newArr = state.settings.logDisplayFilters.excludeCategories.concat(cat);
      state.settings.logDisplayFilters.excludeCategories = newArr;
      localStorage.setItem('excludeCategories', JSON.stringify(newArr));
    },
    removeFromExcludeCategories(state, cat) {
      const newArr = state.settings.logDisplayFilters.excludeCategories.filter(_cat => (
        cat !== _cat
      ));
      state.settings.logDisplayFilters.excludeCategories = newArr;
      localStorage.setItem('excludeCategories', JSON.stringify(newArr));
    },
    setDateFilter(state, value) {
      state.settings.logDisplayFilters.date = value;
      localStorage.setItem('dateFilter', value);
    },
    clearDisplayFilters(state) {
      state.settings.logDisplayFilters = {
        date: 'ALL_TIME',
        excludeTypes: [],
        excludeCategories: [],
      };
    },
  },
  actions: {
    loadCachedDisplayFilters({ commit }) {
      const exTypes = JSON.parse(localStorage.getItem('excludeTypes'));
      const exCats = JSON.parse(localStorage.getItem('excludeCategories'));
      const date = localStorage.getItem('dateFilter');

      if (exTypes !== null) {
        exTypes.forEach(type => commit('addToExcludeTypes', type));
      }
      if (exCats !== null) {
        exCats.forEach(cat => commit('addToExcludeCategories', cat));
      }
      if (date !== null) {
        commit('setDateFilter', date);
      }
    },
    resetDisplayFilters({ commit }) {
      commit('clearDisplayFilters');
      localStorage.setItem('excludeTypes', '[]');
      localStorage.setItem('excludeCategories', '[]');
      localStorage.setItem('dateFilter', 'ALL_TIME');
    },
  },
};
