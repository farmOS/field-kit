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
    });
  },
};
