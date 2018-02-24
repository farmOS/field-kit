import Vue from 'vue';
import Vuex from 'vuex';

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

export default new Vuex.Store({
  modules: {
    shell: shellModule,
  }
})
