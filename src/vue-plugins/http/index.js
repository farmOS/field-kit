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
    // This handles the custom error type defined in ./module.js
    function handleSyncError(syncError) {
      // First set all logs to not ready to sync so their spinners stops spinning
      store.commit('updateAllLogs', log => ({ ...log, isReadyToSync: false }));
      const logNames = syncError.indices.length > 0
        ? syncError.indices.reduce((acc, cur) => `${acc}, "${store.state.farm.logs[cur]}"`, '')
        : '';
      // Do something with a TypeError object (mostly likely no connection)
      if (typeof syncError.http === 'object' && syncError.http.status === undefined) {
        const errorPayload = {
          message: `Unable to sync ${logNames} because the network is currently unavailable. Please try syncing again later.`,
          errorCode: syncError.http.statusText,
          level: 'warning',
          show: true,
        };
        store.commit('logError', errorPayload);
      } else if (syncError.http.status === 401
        || syncError.http.status === 403
        || syncError.http.status === 404) {
        // Reroute authentication or authorization errors to login page
        router.push('/login');
      } else {
        // Handle some other type of runtime error (if possible)
        const errMsg = `${syncError.http.status} error while syncing "${logNames}": ${syncError.http.statusText}`;

        const errorPayload = {
          message: errMsg,
          errorCode: syncError.http.statusText,
          level: 'warning',
          show: true,
        };
        store.commit('logError', errorPayload);
      }
    }

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
          // Sync logs with the server, unless the user isn't logged in
          if (localStorage.getItem('token')) {
            // First set all local logs ready to sync
            store.commit('updateAllLogs', log => ({ ...log, isReadyToSync: true }));
            // Get and process logs from the server in httpModule
            store.dispatch('getServerLogs')
              .then(() => {
                // Save the current time as the most recent syncDate
                localStorage.setItem('syncDate', (Date.now() / 1000).toFixed(0));
                // After getServerLogs finishes, we send logs with isReadyToSync true to the server
                const indices = store.state.farm.logs.reduce(syncReducer, []);
                store.dispatch('sendLogs', indices);
              })
              .catch(handleSyncError);
          } else {
            router.push('/login');
          }
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
