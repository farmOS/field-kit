import { createStore } from 'vuex';
import entities from './entities';
// import l10nModule from './l10n/module';

const store = createStore({
  state: {
    ...entities.state,
  },
  mutations: {
    ...entities.mutations,
  },
  actions: {
    ...entities.actions,
  },
  modules: {
    // l10n: l10nModule,
  },
});

export default store;
