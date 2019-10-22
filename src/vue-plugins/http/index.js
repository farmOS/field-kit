import module from './module';

export default {
  install(Vue, { store, router }) {
    /*
      A reducer function that filters for logs ready to sync,
      and returns an array of only those logs' indices.

      This function also enforces the following criteria for specific log types:
        - Seedings must be associated with at least one planting asset
    */
    function syncReducer(indices, curLog, curIndex) {
      // Check if criteria for specific log types are met
      function criteriaMet(log, index) {
        const errorPayload = {
          message: '',
          level: 'warning',
          show: true,
        };

        // Criteria enforcement for seedings:
        if (log.type.data === 'farm_seeding') {
          // If a seeding log does not have at least one planting asset, don't sync it
          const allAssets = store.state.farm.assets;
          const plantingAssets = [];
          log.asset.data.forEach((logAsset) => {
            allAssets.forEach((asset) => {
              if (asset.id === logAsset.id && asset.type === 'planting') {
                plantingAssets.push(asset.id);
              }
            });
          });
          if (plantingAssets.length < 1) {
            errorPayload.message = `Could not sync ${log.name.data} because seeding logs must have at least one planting asset.`;
            store.commit('logError', errorPayload);
            store.dispatch('unreadyLog', index);
            return false;
          }
        }

        // Sync any other type of log
        return true;
      }

      // Sync all logs to the server; those originally from server will have id fields
      if (curLog.isReadyToSync !== undefined
        && JSON.parse(curLog.isReadyToSync)
        && !JSON.parse(curLog.wasPushedToServer)
        && criteriaMet(curLog, curIndex)) {
        return indices.concat(curIndex);
      }
      return indices;
    }

    /*
    This handles the custom error type defined in ./module.js, thrown by getServerLogs and sendLogs
    - SyncError contains a responses attribute, which is an array of response objects
    - Each response always contains a status attribute
    - Responses thrown by sendLogs contain an index attribute
    - Responses thrown by getServerLogs no index but do contain a message attribute
    */
    function handleSyncError(syncError) {
      // First set all logs to not ready to sync so their spinners stops spinning
      store.commit('updateAllLogs', log => ({ ...log, isReadyToSync: false }));
      // Create a message string that we will build out as we go.
      let errMsg = '';
      if (syncError.responses.length === 0) {
        // If we receive no response whatsoever, the device is offline
        errMsg += 'Unable to sync because the network is currently unavailable.';
      } else {
        // Build a message from sendLogs errors, which have an index
        syncError.responses.forEach((response) => {
          if (response.status === 401
            || response.status === 403
            || response.status === 404) {
            // 401, 403 and 404 errors indicate bad credentials - push to login
            router.push('/login');
          } else if (response.index === undefined) {
            // If response.index is undefined, the error was thrown by a getServerLogs request
            errMsg += `${response.status} error: ${response.message}`;
          } else {
            // Otherwise, the error was thrown by a sendLogs request
            const logName = store.state.farm.logs[response.index].name.data;
            errMsg += `${response.status} error while syncing "${logName}" <br>`;
          }
        });
      }
      if (errMsg !== '') {
        // Display an error if there is message text
        const errorPayload = {
          message: errMsg,
          errorCode: '',
          level: 'warning',
          show: true,
        };
        store.commit('logError', errorPayload);
      }
    }

    store.registerModule('http', module);
    store.subscribeAction({
      after: (action) => {
        if (action.type === 'forceSyncAssetsAndAreas') {
          if (localStorage.getItem('host') !== null) {
            store.dispatch('updateAssets');
            store.dispatch('updateAreas');
            return;
          }
          router.push('/login');
        }
        if (action.type === 'getLogs') {
          // Sync logs with the server, unless the user isn't logged in
          if (localStorage.getItem('token')) {
            // First set all local logs ready to sync
            store.commit('updateAllLogs', log => ({ ...log, isReadyToSync: true }));
            // Get and process logs from the server in httpModule
            store.dispatch('getServerLogs')
              .then(() => {
                // Save the current time as the most recent syncDate
                localStorage.setItem('syncDate', (Date.now() / 1000).toFixed(0));
                // After getServerLogs finishes, we send logs with isReadyToSync true to the server
                const indices = store.state.farm.logs.reduce(syncReducer, []);
                return store.dispatch('sendLogs', indices);
              })
              // Handle syncErrors thrown by getServerLogs
              .catch(handleSyncError);
          } else {
            router.push('/login');
          }
        }
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
