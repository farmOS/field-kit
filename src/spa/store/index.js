import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    shell: {
      greeting: 'Welcome to farmOS!'
    }
  },
  mutations: {
    changeGreeting (state, newGreeting) {
      state.shell.greeting = newGreeting;
    }
  }
})
