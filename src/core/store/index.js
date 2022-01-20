import { createStore } from 'vuex';
import core from './core';
import configDocuments from './configDocuments';
import entities from './entities';
import camModule from './camModule';
// import l10nModule from './l10n/module';

const store = createStore({
  state: {
    ...core.state,
    ...configDocuments.state,
    ...entities.state,
  },
  mutations: {
    ...core.mutations,
    ...configDocuments.mutations,
    ...entities.mutations,
  },
  actions: {
    ...core.actions,
    ...configDocuments.actions,
    ...entities.actions,
  },
  modules: {
    cam: camModule,
    // l10n: l10nModule,
  },
});

export default store;
