import { createStore } from 'vuex';
import core from './core';
import entities from './entities';
// import l10nModule from './l10n/module';

const store = createStore({
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
    // l10n: l10nModule,
  },
});

export default store;
