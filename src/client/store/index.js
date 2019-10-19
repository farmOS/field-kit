import Vue from 'vue';
import Vuex from 'vuex';
import makeLog from '../../utils/makeLog';
import geoModule from './geoModule';

Vue.use(Vuex);

const shellModule = {
  state: {
    errors: [],
    user: {
      name: '',
      email: '',
      uid: null,
      isLoggedIn: false,
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

const farmModule = {
  state: {
    name: '',
    url: '',
    logs: [],
    assets: [],
    areas: [],
    currentLogIndex: 0,
    photoLoc: '',
    geolocation: {},
    localArea: [],
    units: [],
    categories: [],
    equipment: [],
  },
  mutations: {
    changeFarmName(state, name) {
      state.name = name;
    },
    changeFarmUrl(state, url) {
      state.url = url;
    },
    addLogs(state, logs) {
      // TODO: Should logs pass through logFactory() to make sure props are valid?
      state.logs = state.logs.concat(logs);
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
    /*
    updateUnitsFromCache. updateCategoriesFromCache and updateEquipmentFromCache are distinct from
    addUnits because they are NOT hooks for updating units/ cats in the database.  They ONLY add
    units/ cats to the local store.  updateUnitsFromCache is called by websql/module/loadCachedUnits
    addUnits is called by http/module/updateUnits
    */
    updateUnitsFromCache(state, units) {
      state.units = state.units.concat(units);
    },
    updateCategoriesFromCache(state, cats) {
      state.categories = state.categories.concat(cats);
    },
    updateEquipmentFromCache(state, equip) {
      state.equipment = state.equipment.concat(equip);
    },
    /*
      This pushes the new log onto the `logs` array, and b/c `.push()` returns
      the length of the new array, it resets the index to the new item too
    */
    addLogAndMakeCurrent(state, newLog) {
      state.currentLogIndex = state.logs.push(newLog) - 1;
    },
    // This is called when new logs from the server are added
    // FIXME: Leaky abstraction; shouldn't have server/db details here
    addLogFromServer(state, newLog) {
      const newIndex = state.logs.push(newLog) - 1;
      this.dispatch('serverLogToDb', { index: newIndex, log: newLog });
    },
    setCurrentLogIndex(state, index) {
      state.currentLogIndex = index;
    },
    updateLog(state, { index, props }) {
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
    // updateAsset and updateArea replace the entire record if a change occurs
    updateAsset(state, newAsset) {
      const index = state.assets.findIndex(a => a.id === newAsset.id);
      state.assets.splice(index, 1, newAsset);
    },
    updateArea(state, newArea) {
      const index = state.areas.findIndex(a => a.id === newArea.id);
      state.areas.splice(index, 1, newArea);
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

    setPhotoLoc(state, loc) {
      state.photoLoc = loc;
    },
    setGeoloc(state, geoloc) {
      state.geolocation = geoloc;
    },
    addLocalArea(state, area) {
      state.localArea.push(area);
    },
    clearLocalArea(state) {
      state.localArea = [];
    },
  },
  actions: {
    // TODO: Should this logic be moved to the 'addLogAndMakeCurrent' mutation?
    //    Or perhaps just the logFactory, and pass in the date and logType as
    //    a `newProps` object from a component method.
    initializeLog({ commit }, logType) {
      const curDate = new Date();
      const timestamp = Math.floor(curDate / 1000).toString();
      const curTimeString = curDate.toLocaleTimeString('en-US');
      const curDateString = curDate.toLocaleDateString('en-US');
      const newLog = makeLog.create({
        type: { data: logType, changed: timestamp },
        name: { data: `${curDateString} - ${curTimeString}`, changed: timestamp },
        // TODO: Try to decouple this further from the login plugin
        timestamp: { data: timestamp, changed: timestamp },
      });
      commit('addLogAndMakeCurrent', newLog);
    },
    forceSyncAssetsAndAreas() {
      // this is just a hook for synchronizing via the httpModule
    },
    getLogs() {
      // Right now, this is just a hook to call getServerLogs in the httpModule
    },
    serverLogToDb() {
      // Right now, this is just a hook to call createLogFromServer in the dbModule
    },
    onLogsComponentCreated() {
      // A hook for initializng other actions when Logs.vue is created
    },
  },
};

export default new Vuex.Store({
  modules: {
    shell: shellModule,
    farm: farmModule,
    geo: geoModule,
  },
});
