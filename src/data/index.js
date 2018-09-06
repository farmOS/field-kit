import dbModule from './dbModule';
import httpModule from './httpModule';
import camModule from './camModule';

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
  install(Vue, { store, router }) {
    store.registerModule('data', dbModule);
    store.registerModule('http', httpModule);
    store.registerModule('camera', camModule);
    store.subscribe((mutation) => {
      if (mutation.type === 'addLogAndMakeCurrent') {
        store.dispatch('createRecord', mutation.payload);
      }
      if (mutation.type === 'updateCurrentLog' && !mutation.payload.isCachedLocally) {
        store.dispatch('updateRecord', mutation.payload);
      }
      if (mutation.type === 'updateAllLogs') {
        const indices = store.state.farm.logs.reduce(syncReducer, []);
        store.dispatch('pushToServer', { indices, router });
      }
      if (mutation.type === 'updateLogs') {
        mutation.payload.indices.forEach((i) => {
          store.dispatch('updateRecord', store.state.farm.logs[i]);
        });
      }
      if (mutation.type === 'deleteLog') {
        store.dispatch('deleteRecord', mutation.payload);
      }
    });
  },
};
