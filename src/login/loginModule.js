export default {
  state: {
    isLoggedIn: false,
    name: null,
  },
  mutations: {
    login(state, creds) {
      state.isLoggedIn = true;
      state.name = creds.username;
    }
  }
}
