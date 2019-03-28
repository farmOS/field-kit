import module from './module';

/*
  A reducer function that filters for logs ready to sync,
  and returns an array of only those logs' indices.
*/
function syncReducer(indices, curLog, curIndex) {
  // Sync all logs to the server; those originally from server will have id fields
  if (curLog.isReadyToSync !== undefined && JSON.parse(curLog.isReadyToSync) && !JSON.parse(curLog.wasPushedToServer)) { // eslint-disable-line max-len
    return indices.concat(curIndex);
  }
  return indices;
}

// A function that sets all logs ready to sync; used with updateAllLogs
function logSyncer(log) {
  return {
    ...log,
    isReadyToSync: true,
  };
}

export default {
  install(Vue, { store, router }) {
    store.registerModule('http', module);
    store.subscribeAction({
      after: (action) => {
        if (action.type === 'forceSyncAssetsAndAreas') {
          if (localStorage.getItem('host') !== null) {
            store.dispatch('updateAssets').then().catch((err) => {
              if (err.status === 403 || err.status === 401) {
                router.push('/login');
                return;
              }
              const errorPayload = {
                message: `${err.status} error while syncing assets: ${err.statusText}`,
                errorCode: err.statusText,
                level: 'warning',
                show: true,
              };
              store.commit('logError', errorPayload);
            });
            store.dispatch('updateAreas').then().catch((err) => {
              if (err.status === 403 || err.status === 401) {
                router.push('/login');
                return;
              }
              const errorPayload = {
                message: `${err.status} error while syncing areas: ${err.statusText}`,
                errorCode: err.statusText,
                level: 'warning',
                show: true,
              };
              store.commit('logError', errorPayload);
            });
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
          store.commit('updateAllLogs', logSyncer);
          // Get and process logs from the server in httpModule
          store.dispatch('getServerLogs')
            .then(() => {
              // Save the current time as the most recent syncDate
              localStorage.setItem('syncDate', (Date.now() / 1000).toFixed(0));
              // After getServerLogs finishes, we send logs with isReadyToSync true to the server
              const indices = store.state.farm.logs.reduce(syncReducer, []);
              store.dispatch('sendLogs', { indices, router });
            }).catch((err) => {
              if (err.status === 403 || err.status === 401) {
                router.push('/login');
                return;
              }
              const errorPayload = {
                message: `${err.status} error while syncing logs: ${err.statusText}`,
                errorCode: err.statusText,
                level: 'warning',
                show: true,
              };
              store.commit('logError', errorPayload);
            });
        }
        if (action.type === 'serverLogToDb') {
          store.dispatch('createLogFromServer', action.payload);
        }
        if (action.type === 'loadCachedAssets') {
          store.dispatch('updateAssets');
        }
        if (action.type === 'loadCachedAreas') {
          store.dispatch('updateAreas');
        }
        // Only update units when logs have been obtained from the server

        if (action.type === 'sendLogs') {
          store.dispatch('updateUnits');
        }
      },
    });
  },
};
