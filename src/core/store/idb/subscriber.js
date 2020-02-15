const makeIDBSubscriber = store => ({ type, payload }) => {
  if (type === 'addLogs' && payload.isCachedLocally === false) {
    store.dispatch('updateCachedLog', payload);
  }
  if (type === 'deleteLog') {
    store.dispatch('deleteCachedLog', payload);
  }
  if (type === 'addAssets') {
    payload.forEach((asset) => {
      store.dispatch('createCachedAsset', asset);
    });
  }
  if (type === 'deleteAllAssets') {
    store.dispatch('deleteAllCachedAssets');
  }
  if (type === 'addAreas') {
    payload.forEach((area) => {
      store.dispatch('createCachedArea', area);
    });
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
};

export default makeIDBSubscriber;
