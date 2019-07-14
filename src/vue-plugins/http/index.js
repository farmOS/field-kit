import module from './module';

/*
  A reducer function that filters for logs ready to sync,
  and returns an array of only those logs' indices.
*/
function syncReducer(indices, curLog, curIndex) {
  // Sync all logs to the server; those originally from server will have id fields
  if (curLog.isReadyToSync !== undefined
    && JSON.parse(curLog.isReadyToSync)
    && !JSON.parse(curLog.wasPushedToServer)) {
    return indices.concat(curIndex);
  }
  return indices;
}

export default {
  install(Vue, { store, router }) {
    store.registerModule('http', module);
    store.subscribeAction({
      after: (action) => {
        if (action.type === 'forceSyncAssetsAndAreas') {
          if (localStorage.getItem('host') !== null) {
            store.dispatch('updateAssets');
            store.dispatch('updateAreas');
            return;
          }
          router.push('/login');
        }
        if (action.type === 'getLogs') {
          /*
          Triggered when the 'sync' button is pressed in allLogs
          First set all local logs ready to sync. This status will be retained unless
          the local log is over-written with a log from the server.
          */
          store.commit('updateAllLogs', log => ({ ...log, isReadyToSync: true }));
          // Get and process logs from the server in httpModule
          store.dispatch('getServerLogs', router)
            .then(() => {
              // Save the current time as the most recent syncDate
              localStorage.setItem('syncDate', (Date.now() / 1000).toFixed(0));
              // After getServerLogs finishes, we send logs with isReadyToSync true to the server
              const indices = store.state.farm.logs.reduce(syncReducer, []);
              store.dispatch('sendLogs', { indices, router });
            })
            .then(() => {
              store.commit('updateAllLogs', log => ({ ...log, isReadyToSync: false }));
            });
        }
        if (action.type === 'serverLogToDb') {
          store.dispatch('createLogFromServer', action.payload);
        }
        // When assets or areas are retrieved from the store, ALSO retrieve from the server
        // This means a call to the server on app load.
        // *** I think it would be better to retrieve only when the sync button is tapped
        if (action.type === 'loadCachedAssets') {
          store.dispatch('updateAssets');
        }
        if (action.type === 'loadCachedAreas') {
          store.dispatch('updateAreas');
        }
        // Update units, categories and equipment from server ONLY when sync button is tapped
        if (action.type === 'sendLogs') {
          store.dispatch('updateUnits')
            .then(store.dispatch('updateCategories'))
            .then(store.dispatch('updateEquipment'));
        }
      },
    });
  },
};
