import testObs from './testObs';

export default {
  state: {
    test: 'this is some test state',
    logs: [],
    areas: [],
    assets: [],
  },
  mutations: {
    changeTestState (state, msg) {
      state.test = msg;
    },
    addUnsyncedLogsToState(state, payload) {
      state.logs = state.logs.concat(payload)
    }
  },
  actions: {

    changeTestState ({commit}, msg) {
      commit('changeTestState', msg);
    },

    loadCachedLogs({commit}) {
      // Maybe some WebSQL Queries could happen here instead?
      const payload = () => {
        return {
          id: testObs.id,
          name: testObs.name,
          uid: testObs.uid,
          timestamp: testObs.timestamp,
          notes: testObs.field_farm_notes,
          synced: false
        }
      };
      commit('addUnsyncedLogsToState', payload())
    },

    // Save a log to the local database.
    saveLog () {
      // WebSQL...
    },

    // Push records to farmOS via REST API.
    pushRecords () {
      // AJAX request...
    },
  }
}
