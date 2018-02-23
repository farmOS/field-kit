export default {
  state: {
    test: 'this is some test state',
    unsynced: {
      logs: [],
    },
    areas: [],
    assets: [],
  },
  mutations: {
    changeTestState (state, msg) {
      state.test = msg;
    }
  },
  actions: {

    // Save a log to the local database.
    save_log () {
      // WebSQL...
    },

    // Push records to farmOS via REST API.
    push_records () {
      // AJAX request...
    },
  }
}
