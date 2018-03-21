import dataModule from './dataModule';

export default {
  install(Vue, {store, router}) {
    store.registerModule('data', dataModule);
    router.afterEach( (to, from) => {
      if (to.name === 'NewObservation') {
        store.commit('clearLogs');
        store.dispatch('loadCachedLogs', 'farm_observation');
      }
    });
    store.subscribe( (mutation, state) => {
      if (mutation.type === 'addLogAndMakeCurrent') {
        store.dispatch('createRecord', mutation.payload);
      }
      if (mutation.type === 'updateCurrentLog' && !mutation.payload.isCachedLocally) {
        store.dispatch('updateRecord', mutation.payload);
      }
    });
  }
}
