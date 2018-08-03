import dataModule from './dataModule';

/*
  A reducer function that filters for logs ready to sync,
  and returns an array of only those logs' indices.
*/
function syncReducer(indices, curLog, curIndex) {
  if (curLog.isReadyToSync && !curLog.wasPushedToServer) {
    return indices.concat(curIndex);
  }
  return indices;
}

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
        const payload = store.logs.reduce(syncReducer, []);
        store.dispatch('pushToServer', payload);
      }
    });
  },
};
