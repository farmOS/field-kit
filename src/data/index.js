import dbModule from './dbModule';
import httpModule from './httpModule';
import camModule from './camModule';

/*
  A reducer function that filters for logs ready to sync,
  and returns an array of only those logs' indices.
*/
function syncReducer(indices, curLog, curIndex) {
  // Sync all logs to the server; those originally from server will have id fields
  console.log('CHECK STATUS REDUCER ISREADYTOSYNC', curLog.isReadyToSync);
  console.log('CHECK STATUS REDUCER WASPUSHEDTOSERVER', JSON.parse(curLog.wasPushedToServer));
  if (curLog.isReadyToSync !== undefined && JSON.parse(curLog.isReadyToSync) && !JSON.parse(curLog.wasPushedToServer)) {
  // if (curLog) {
    console.log('CHECK STATUS INDEXED TO SEND', curIndex);
    return indices.concat(curIndex);
  }
  return indices;
}

// A function that sets all logs ready to sync; used with updateAllLogs
function logSyncer(log) {
  console.log('CHECK STATUS RUNNING LOG SYNCER')
  return {
    ...log,
    isReadyToSync: true,
  };
}

export default {
  install(Vue, { store, router }) {
    store.registerModule('data', dbModule);
    store.registerModule('http', httpModule);
    store.registerModule('camera', camModule);
    router.beforeEach((to, from, next) => {
      // Loads logs and user data when /logs or /logs/ routes are called
      // The former is called at app load; the latter when the user navigates
      // back to AllLogs using the menu (child view w/ url '')
      if (to.path === '/logs/' || to.path === '/logs') {
        store.commit('clearLogs');
        store.dispatch('loadCachedUserAndSiteInfo');
        store.dispatch('loadCachedLogs');
        next();
      }
      // loads assets, areas and user data when ANY /logs/edit route is called
      if (to.path.includes('/logs/edit')) {
        store.dispatch('loadCachedUserAndSiteInfo');
        store.commit('clearAssets');
        store.commit('clearAreas');
        store.dispatch('loadCachedAssets')
          .then(() => store.dispatch('updateAssets'));
        store.dispatch('loadCachedAreas')
          .then(() => store.dispatch('updateAreas'));
        next();
      }
      next();
    });
    store.subscribe((mutation) => {
      if (mutation.type === 'addLogAndMakeCurrent') {
        store.dispatch('createLog', mutation.payload);
      }
      if (mutation.type === 'updateCurrentLog' && !JSON.parse(mutation.payload.isCachedLocally)) {
        store.dispatch('updateLog', mutation.payload);
      }
      if (mutation.type === 'updateLogFromServer' && !JSON.parse(mutation.payload.log.isCachedLocally)) {
        store.dispatch('updateLogAtIndex', mutation.payload);
      }
      if (mutation.type === 'updateAllLogs') {
        // These will be tentatively called in getServerLogs.then, in the getLogs subscription
        // const indices = store.state.farm.logs.reduce(syncReducer, []);
        // store.dispatch('sendLogs', { indices, router });
      }
      if (mutation.type === 'updateLogs') {
        mutation.payload.indices.forEach((i) => {
          store.dispatch('updateLog', store.state.farm.logs[i]);
        });
      }
      if (mutation.type === 'deleteLog') {
        store.dispatch('deleteLog', mutation.payload);
      }
      if (mutation.type === 'addAssets') {
        mutation.payload.forEach((asset) => {
          store.dispatch('createCachedAsset', asset);
        });
      }
      if (mutation.type === 'updateAsset') {
        store.dispatch('updateCachedAsset', mutation.payload);
      }
      if (mutation.type === 'deleteAllAssets') {
        store.dispatch('deleteAllCachedAssets');
      }
      if (mutation.type === 'deleteAllAreas') {
        store.dispatch('deleteAllCachedAreas');
      }
      if (mutation.type === 'addAreas') {
        mutation.payload.forEach((area) => {
          store.dispatch('createCachedArea', area);
        });
      }
      if (mutation.type === 'updateArea') {
        store.dispatch('updateCachedArea', mutation.payload);
      }
      if (mutation.type === 'setUseGeolocation') {
        localStorage.setItem('useGeolocation', mutation.payload);
      }
    });
    store.subscribeAction((action) => {
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
    });
  },
};
