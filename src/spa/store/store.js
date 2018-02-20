import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {
      isLoggedIn: false,
      name: null,
    }
  },
  mutations: {
    login(state, creds) {
      state.user.isLoggedIn = true;
      state.user.name = creds.username;
    }
  }
})
