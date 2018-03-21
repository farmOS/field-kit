import Vue from 'vue';
import Vuex from 'vuex';
import {logFactory} from '../../data/logFactory';

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
    test: 'some state',
    logs: [],
    assets: [],
    areas: [],
    currentLogIndex: 0,
  },
  mutations: {
    addLogs(state, logs) {
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
    }
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
        field_farm_log_owner: rootState.user.name ? rootState.user.name : '',
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
