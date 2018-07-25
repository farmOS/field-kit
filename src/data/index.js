import dataModule from './dataModule';

export default {
  install(Vue, {store, router}) {
    store.registerModule('data', dataModule);
    // TODO: give the client more control over when to retrieve cached logs
    router.afterEach( (to, from) => {
      if (to.name === 'Observations') {
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
