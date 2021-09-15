import Vue from 'vue';
import Vuex from 'vuex';
import core from './core';
import entities from './entities';
import camModule from './camModule';
// import l10nModule from './l10n/module';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    ...core.state,
    ...entities.state,
  },
  mutations: {
    ...core.mutations,
    ...entities.mutations,
  },
  actions: {
    ...core.actions,
    ...entities.actions,
  },
  modules: {
    cam: camModule,
    // l10n: l10nModule,
  },
});

export default store;
