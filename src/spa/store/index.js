import Vue from 'vue';
import Vuex from 'vuex';
import {logFactory} from './logFactory';

Vue.use(Vuex);

const shellModule = {
  state: {
    greeting: 'Welcome to farmOS!'
  },
  mutations: {
    changeGreeting (state, newGreeting) {
      state.greeting = newGreeting;
    }
  },
}

const farmModule = {
  state: {
    logs: [],
    assets: [],
    areas: [],
    currentLogIndex: 0,
    isWorking: false,
    statusText: '',
  },
  mutations: {
    addLogs(state, logs) {
      // TODO: Should logs pass through logFactory() to make sure props are valid?
      state.logs = state.logs.concat(logs);
    },
    addLogAndMakeCurrent(state, newLog) {
      state.currentLogIndex = state.logs.push(newLog) -1;
    },
    updateCurrentLog (state, newProps) {
      const updatedLog = logFactory({
        ...state.logs[state.currentLogIndex],
        ...newProps
      });
      state.logs.splice(state.currentLogIndex, 1, updatedLog);
    },
    clearLogs (state, payload) {
      state.logs.splice(0, state.logs.length);
    },
    setIsWorking (state, booleanValue) {
      state.isWorking = booleanValue;
    },
    setStatusText (state, text) {
      state.statusText = text;
    },
  },
  actions: {
    // TODO: Should this logic be moved to the 'addLogAndMakeCurrent' mutation?
    //    Or perhaps just the logFactory, and pass in the date and logType as
    //    a `newProps` object from a component method.
    initializeLog({commit, rootState}, logType) {
      // TODO: The User ID will also be needed to sync with server
      const curDate = new Date(Date.now());
      const timestamp = Math.floor(curDate / 1000).toString();
      const curTimeString = curDate.toLocaleTimeString('en-US');
      const curDateString = curDate.toLocaleDateString('en-US');
      const newLog = logFactory({
        type: logType,
        name: `Observation: ${curDateString} - ${curTimeString}`,
        // TODO: Try to decouple this further from the login plugin
        log_owner: (rootState.user) ? rootState.user.name : '',
        timestamp: timestamp,
      });
      commit('addLogAndMakeCurrent', newLog);
    },
  }
}

export default new Vuex.Store({
  modules: {
    shell: shellModule,
    farm: farmModule
  }
})
