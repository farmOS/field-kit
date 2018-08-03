import dataModule from './dataModule';

export default {
  install(Vue, { store /* , router */ }) {
    store.registerModule('data', dataModule);
    store.subscribe((mutation) => {
      if (mutation.type === 'addLogAndMakeCurrent') {
        store.dispatch('createRecord', mutation.payload);
      }
      if (mutation.type === 'updateCurrentLog' && !mutation.payload.isCachedLocally) {
        store.dispatch('updateRecord', mutation.payload);
      }
      if (mutation.type === 'updateAllLogs') {
        // TODO: Uncomment this once `pushToServer` can handle multiple logs
        // const payload = store.logs.filter(log => log.isReadyToSync);
        store.dispatch('pushToServer'/* , payload */);
      }
    });
  },
};
