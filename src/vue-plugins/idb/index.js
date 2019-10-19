import module from './module';

export default {
  install(Vue, { store }) {
    store.registerModule('idb', module);
    store.subscribeAction((action) => {
      // Load logs, areas, assets & user info when the Logs component is created
      if (action.type === 'onLogsComponentCreated') {
        store.dispatch('loadCachedUserAndSiteInfo');
        store.dispatch('updateUserAndSiteInfo');
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
    store.subscribe(({ type, payload }) => {
      if (type === 'addLogAndMakeCurrent') {
        store.dispatch('createCachedLog', payload);
      }
      if (type === 'updateLog' && !payload.props.isCachedLocally) {
        store.dispatch('updateCachedLogAtIndex', payload);
      }
      if (type === 'deleteLog') {
        store.dispatch('deleteCachedLog', payload);
      }
      if (type === 'addAssets') {
        payload.forEach((asset) => {
          store.dispatch('createCachedAsset', asset);
        });
      }
      if (type === 'updateAsset') {
        store.dispatch('updateCachedAsset', payload);
      }
      if (type === 'deleteAllAssets') {
        store.dispatch('deleteAllCachedAssets');
      }
      if (type === 'addAreas') {
        payload.forEach((area) => {
          store.dispatch('createCachedArea', area);
        });
      }
      if (type === 'updateArea') {
        store.dispatch('updateCachedArea', payload);
      }
      if (type === 'deleteAllAreas') {
        store.dispatch('deleteAllCachedAreas');
      }
      if (type === 'addUnits') {
        payload.forEach((unit) => {
          store.dispatch('createCachedUnit', unit);
        });
      }
      if (type === 'deleteAllUnits') {
        store.dispatch('deleteAllCachedUnits');
      }
      if (type === 'addCategories') {
        payload.forEach((cat) => {
          store.dispatch('createCachedCategory', cat);
        });
      }
      if (type === 'deleteAllCategories') {
        store.dispatch('deleteAllCachedCategories');
      }
      if (type === 'addEquipment') {
        payload.forEach((equip) => {
          store.dispatch('createCachedEquipment', equip);
        });
      }
      if (type === 'deleteAllEquipment') {
        store.dispatch('deleteAllCachedEquipment');
      }
      if (type === 'setUseGeolocation') {
        localStorage.setItem('useGeolocation', payload);
      }
    });
  },
};
