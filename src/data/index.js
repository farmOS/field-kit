import dbModule from './dbModule';
import httpModule from './httpModule';
import camModule from './camModule';
import Test from './Test.vue'; // eslint-disable-line import/extensions

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
      if (to.path === '/logs') {
        store.commit('clearLogs');
        store.commit('clearAssets');
        store.commit('clearAreas');
        store.dispatch('loadCachedLogs');
        store.dispatch('updateAssets')
          .then(() => console.log('Successfully updaated Assets'))
          .catch(() => store.dispatch('loadCachedAssets'));
        store.dispatch('updateAreas')
          .then(() => console.log('Successfully updated Areas'))
          .catch(() => store.dispatch('loadCachedAreas'));
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
      if (mutation.type === 'addAreas') {
        mutation.payload.forEach((area) => {
          store.dispatch('createCachedArea', area);
        });
      }
      if (mutation.type === 'updateArea') {
        store.dispatch('updateCachedArea', mutation.payload);
      }
    });
    const TestComponent = Vue.component(Test.name, Test);
    router.addRoutes([{
      path: '/test',
      name: 'Test',
      component: TestComponent,
    }]);
  },
};
