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
    router.beforeEach((to, from, next) => {
      // Loads logs and user data when /logs route is called
      if (to.path === '/logs') {
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
      if (mutation.type === 'updateCurrentLog' && !mutation.payload.isCachedLocally) {
        store.dispatch('updateLog', mutation.payload);
      }
      if (mutation.type === 'updateAllLogs') {
        const indices = store.state.farm.logs.reduce(syncReducer, []);
        store.dispatch('sendLogs', { indices, router });
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
    });
  },
};
