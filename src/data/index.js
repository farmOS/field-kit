import dataModule from './dataModule';

export default {
  install(Vue, { store /* , router */ }) {
    store.registerModule('data', dataModule);
    /*
      TODO: Delete this when we're sure we want to give over full control
      to the client components when logs need to be loaded from
      local persistance, whether that's WebSQL, IDB, etc. Leaving it for
      reference temporarily.
    */
    // router.afterEach((to) => {
    //   if (to.name === 'Observations') {
    //     store.commit('clearLogs');
    //     store.dispatch('loadCachedLogs', 'farm_observation');
    //   }
    // });
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
