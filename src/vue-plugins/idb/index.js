import module from './module';

export default {
  install(Vue, { store }) {
    store.registerModule('idb', module);
    store.subscribeAction((action) => {
      // Load logs, areas, assets & user info when the Logs component is created
      if (action.type === 'onLogsComponentCreated') {
        store.dispatch('loadCachedUserAndSiteInfo');
        store.commit('clearLogs');
        store.commit('clearAssets');
        store.commit('clearAreas');
        store.commit('clearUnits');
        store.commit('clearCategories');
        store.commit('clearEquipment');
        store.dispatch('loadCachedLogs');
        store.dispatch('loadCachedAssets');
        store.dispatch('loadCachedAreas');
        store.dispatch('loadCachedUnits');
        store.dispatch('loadCachedCategories');
        store.dispatch('loadCachedEquipment');
      }
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
      if (mutation.type === 'addAreas') {
        mutation.payload.forEach((area) => {
          store.dispatch('createCachedArea', area);
        });
      }
      if (mutation.type === 'updateArea') {
        store.dispatch('updateCachedArea', mutation.payload);
      }
      if (mutation.type === 'deleteAllAreas') {
        store.dispatch('deleteAllCachedAreas');
      }
      if (mutation.type === 'addUnits') {
        mutation.payload.forEach((unit) => {
          store.dispatch('createCachedUnit', unit);
        });
      }
      if (mutation.type === 'deleteAllUnits') {
        store.dispatch('deleteAllCachedUnits');
      }
      if (mutation.type === 'addCategories') {
        mutation.payload.forEach((cat) => {
          store.dispatch('createCachedCategory', cat);
        });
      }
      if (mutation.type === 'deleteAllCategories') {
        store.dispatch('deleteAllCachedCategories');
      }
      if (mutation.type === 'addEquipment') {
        mutation.payload.forEach((equip) => {
          store.dispatch('createCachedEquipment', equip);
        });
      }
      if (mutation.type === 'deleteAllEquipment') {
        store.dispatch('deleteAllCachedEquipment');
      }
      if (mutation.type === 'setUseGeolocation') {
        localStorage.setItem('useGeolocation', mutation.payload);
      }
    });
  },
};
