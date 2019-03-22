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
    settings: {
      useGeolocation: true,
      // search parameters for getting logs from the server.  Log_owner set when user.uid is set
      logFilters: {
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
      state.settings.logFilters.log_owner = uid;
    },
    setLoginStatus(state, bool) {
      state.user.isLoggedIn = bool;
    },
    setUseGeolocation(state, bool) {
      state.settings.useGeolocation = bool;
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
    /*
      This pushes the new log onto the `logs` array, and b/c `.push()` returns
      the length of the new array, it resets the index to the new item too
    */
    addLogAndMakeCurrent(state, newLog) {
      state.currentLogIndex = state.logs.push(newLog) - 1;
    },
    // This is called when new logs from the server are added
    addLogFromServer(state, newLog) {
      const newIndex = state.logs.push(newLog) - 1;
      this.dispatch('serverLogToDb', { index: newIndex, log: newLog });
    },
    setCurrentLogIndex(state, index) {
      state.currentLogIndex = index;
    },
    updateCurrentLog(state, newProps) {
      const updatedLog = makeLog.create({
        ...state.logs[state.currentLogIndex],
        ...newProps,
      });
      state.logs.splice(state.currentLogIndex, 1, updatedLog);
    },
    updateLogFromServer(state, params) {
      state.logs.splice(params.index, 1, params.log);
    },
    // Takes a function as payload and applies it to each log object
    updateAllLogs(state, fn) {
      state.logs = state.logs.map(log => fn(log));
    },
    /*
      Takes a payload with 2 properties: `indices`, which is an array of
      the indices of all the logs to be updated; and `mapper`, a function to be
      applied to each log, mapping the desired update onto the logs' state.
    */
    updateLogs(state, payload) {
      payload.indices.map(i => state.logs.splice(
        i,
        1,
        payload.mapper(state.logs[i]),
      ));
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
  },
};

export default new Vuex.Store({
  modules: {
    shell: shellModule,
    farm: farmModule,
    geo: geoModule,
  },
});
