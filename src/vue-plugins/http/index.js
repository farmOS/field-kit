import module from './module';

export default {
  install(Vue, { store }) {
    store.registerModule('http', module);
    store.subscribeAction({
      after: (action) => {
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
