import Vue from 'vue';
import Vuex from 'vuex';
import logFactory from './logFactory';

Vue.use(Vuex);

const shellModule = {
  state: {
    errors: [],
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
  },
};

const farmModule = {
  state: {
    logs: [],
    assets: [],
    areas: [],
    currentLogIndex: 0,
    isWorking: false,
    statusText: '',
    photoLoc: '',
    geolocation: {},
    localArea: [],
  },
  mutations: {
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
    /*
      This pushes the new log onto the `logs` array, and b/c `.push()` returns
      the length of the new array, it resets the index to the new item too
    */
    addLogAndMakeCurrent(state, newLog) {
      state.currentLogIndex = state.logs.push(newLog) - 1;
    },
    updateCurrentLog(state, newProps) {
      const updatedLog = logFactory({
        ...state.logs[state.currentLogIndex],
        ...newProps,
      });
      state.logs.splice(state.currentLogIndex, 1, updatedLog);
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
    clearLogs(state) {
      state.logs.splice(0, state.logs.length);
    },
    clearAssets(state) {
      state.assets.splice(0, state.assets.length);
    },
    clearAreas(state) {
      state.areas.splice(0, state.areas.length);
    },
    setIsWorking(state, booleanValue) {
      state.isWorking = booleanValue;
    },
    setStatusText(state, text) {
      state.statusText = text;
    },
    setPhotoLoc(state, loc) {
      state.photoLoc = loc;
    },
    setGeoloc(state, geoloc) {
      state.geolocation = geoloc;
    },
    setLocalArea(state, area) {
      state.localArea = area;
    }
  },
  actions: {
    // TODO: Should this logic be moved to the 'addLogAndMakeCurrent' mutation?
    //    Or perhaps just the logFactory, and pass in the date and logType as
    //    a `newProps` object from a component method.
    initializeLog({ commit }, logType) {
      const curDate = new Date(Date.now());
      const timestamp = Math.floor(curDate / 1000).toString();
      const curTimeString = curDate.toLocaleTimeString('en-US');
      const curDateString = curDate.toLocaleDateString('en-US');
      const newLog = logFactory({
        type: logType,
        name: `${curDateString} - ${curTimeString}`,
        // TODO: Try to decouple this further from the login plugin
        timestamp,
      });
      commit('addLogAndMakeCurrent', newLog);
    },
    forceSyncAssetsAndAreas() {
      // this is just a hook for synchronizing via the httpModule
    },
  },
};

export default new Vuex.Store({
  modules: {
    shell: shellModule,
    farm: farmModule,
  },
});
