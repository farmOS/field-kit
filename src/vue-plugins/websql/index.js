import module from './module';

export default {
  install(Vue, { store, router }) {
    store.registerModule('data', module);
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
        store.commit('clearUnits');
        store.dispatch('loadCachedAssets');
        store.dispatch('loadCachedAreas');
        store.dispatch('loadCachedUnits');
        next();
      }
      next();
    });
    store.subscribe((mutation) => {
      if (mutation.type === 'addLogAndMakeCurrent') {
        store.dispatch('createCachedLog', mutation.payload);
      }
      if (mutation.type === 'updateCurrentLog' && !JSON.parse(mutation.payload.isCachedLocally)) {
        store.dispatch('updateCachedLog', mutation.payload);
      }
      if (mutation.type === 'updateLogFromServer' && !JSON.parse(mutation.payload.log.isCachedLocally)) {
        store.dispatch('updateCachedLogAtIndex', mutation.payload);
      }
      if (mutation.type === 'updateLogs') {
        mutation.payload.indices.forEach((i) => {
          store.dispatch('updateCachedLog', store.state.farm.logs[i]);
        });
      }
      if (mutation.type === 'deleteLog') {
        store.dispatch('deleteCachedLog', mutation.payload);
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
      if (mutation.type === 'deleteAllUnits') {
        store.dispatch('deleteAllCachedUnits');
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
  },
};
