import { cachingCriteria, evictionCriteria } from './criteria';

const makeIDBSubscriber = store => ({ type, payload }) => {
  const current = Date.now();
  const meetsCachingCriteria = cachingCriteria(current);
  const meetsEvictionCriteria = evictionCriteria(current);
  if (type === 'addLogs') {
    const logs = Array.isArray(payload) ? payload : [payload];
    logs
      .filter(meetsCachingCriteria)
      .forEach((log) => {
        store.dispatch('updateCachedLog', log);
      });
    logs
      .filter(meetsEvictionCriteria)
      .forEach((log) => {
        store.dispatch('countCachedLogs', log.localID)
          .then((num) => {
            if (num > 0) {
              store.dispatch('deleteCachedLog', log.localID);
            }
          });
      });
  }
  if (type === 'updateLog' && payload.localID) {
    const log = store.state.farm.logs.find(l => l.localID === payload.localID);
    if (meetsCachingCriteria(log)) {
      store.dispatch('updateCachedLog', log);
    }
  }
  if (type === 'mergeLogFromServer') {
    const { id } = payload;
    const localLog = store.state.farm.logs.find(log => +log.id === +id);
    if (!localLog.localID) {
      store.dispatch('generateLogID').then((localID) => {
        store.commit('updateLog', { id, localID });
      });
    } else if (meetsCachingCriteria(localLog)) {
      store.dispatch('updateCachedLog', localLog);
    }
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
