export default {
  state: {
    test: 'this is some test state'
  },
  mutations: {
    changeTestState (state, msg) {
      state.test = msg;
    }
  }
}
