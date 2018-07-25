import dataModule from './dataModule';

export default {
  install(Vue, { store, router }) {
    store.registerModule('data', dataModule);
    // TODO: give the client more control over when to retrieve cached logs
    router.afterEach((to) => {
      if (to.name === 'Observations') {
        store.commit('clearLogs');
        store.dispatch('loadCachedLogs', 'farm_observation');
      }
    });
    store.subscribe((mutation) => {
      if (mutation.type === 'addLogAndMakeCurrent') {
        store.dispatch('createRecord', mutation.payload);
      }
      if (mutation.type === 'updateCurrentLog' && !mutation.payload.isCachedLocally) {
        store.dispatch('updateRecord', mutation.payload);
      }
    });
  },
};
