import farmOS from 'farmos';
import Promise from 'core-js-pure/features/promise';
import router from '@/core/router';
import makeLog from '@/utils/makeLog';
import { SyncError, checkLog, processLog } from './sync';

const farm = () => {
  const host = localStorage.getItem('host');
  const user = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  return farmOS(host, user, password);
};

export default {
  actions: {
    updateAreas({ commit }) {
      return farm().area.get().then((res) => {
        // If a successful response is received, delete and replace all areas
        commit('deleteAllAreas');
        const areas = res.list.map(({ tid, name, geofield }) => ({ tid, name, geofield }));
        commit('addAreas', areas);
      });
    },
    updateAssets({ commit }) {
      return farm().asset.get().then((res) => {
        // If a successful response is received, delete and replace all assets
        commit('deleteAllAssets');
        const assets = res.list.map(({ id, name, type }) => ({ id, name, type }));
        commit('addAssets', assets);
      });
    },
    updateUnits({ commit }) {
      // Return units only.
      return farm().term.get('farm_quantity_units').then((res) => {
        commit('deleteAllUnits');
        const units = res.list.map(({ tid, name }) => ({ tid, name }));
        commit('addUnits', units);
      });
    },
    updateCategories({ commit }) {
      // Return categories only.
      return farm().term.get('farm_log_categories').then((res) => {
        commit('deleteAllCategories');
        const cats = res.list.map(({ tid, name }) => ({ tid, name }));
        commit('addCategories', cats);
      });
    },
    updateEquipment({ commit }) {
      return farm().asset.get().then((res) => {
        commit('deleteAllEquipment');
        const assets = res.list.map(({ id, name, type }) => ({ id, name, type }));
        const equipment = assets.filter(a => a.type === 'equipment');
        commit('addEquipment', equipment);
      });
    },

    // SEND LOGS TO SERVER (step 2 of sync)
    sendLogs({ commit, rootState }, indices) {
      // Update logs in the database and local store after send completes
      function handleSyncResponse(response, index) {
        commit('updateLog', {
          index,
          props: {
            id: response.id,
            remoteUri: response.uri,
            wasPushedToServer: true,
            isReadyToSync: false,
            isCachedLocally: false,
          },
        });
      }
      return Promise.allSettled(
        indices.map((index) => {
        // Either send or post logs, depending on whether they originated on the server
        // Logs originating on the server possess an ID field; others do not.
          const newLog = makeLog.toServer(rootState.farm.logs[index]);
          return farm().log.send(newLog, localStorage.getItem('token'));
        }),
      )
        .then((promises) => {
          const errResponses = promises.reduce((errors, promise, arrayIndex) => {
            if (promise.status === 'rejected') {
              // If the API call returns an error, add the index and status to errResponses
              return errors.push({
                index: indices[arrayIndex],
                status: parseInt(promise.reason.message.substr(-3), 10),
              });
            } if (promise.status === 'fulfilled') {
              handleSyncResponse(promise.value, indices[arrayIndex]);
            }
            return errors;
          }, []);
          if (errResponses.length > 0) {
            throw new SyncError({
              responses: errResponses,
            });
          }
        });
    },

    // GET LOGS FROM SERVER (step 1 of sync)
    getServerLogs({ commit, dispatch, rootState }) {
      const syncDate = localStorage.getItem('syncDate');
      const allLogs = rootState.farm.logs;
      return farm().log.get(rootState.shell.settings.logImportFilters)
        .then(res => (
          // Returns an array of ids which have already been checked & merged
          res.list.map((log) => {
            const checkStatus = checkLog(log, allLogs, syncDate);
            if (checkStatus.serverChange) {
              const mergedLog = processLog(log, checkStatus, syncDate);
              commit('updateLog', {
                index: checkStatus.storeIndex,
                props: mergedLog,
              });
            }
            if (checkStatus.localId === null) {
              const mergedLog = processLog(log, checkStatus, syncDate);
              dispatch('initializeLog', mergedLog);
            }
            return log.id;
          })
        ))
        // Run a 2nd request for the remaining logs not included in the import filters
        .then((checkedIds) => {
          const uncheckedIds = allLogs
            .filter(log => log.id && !checkedIds.some(checkedId => log.id === checkedId))
            .map(log => log.id);
          return farm().log.get(uncheckedIds);
        })
        .then((res) => {
          res.list.forEach((log) => {
            const checkStatus = checkLog(log, allLogs, syncDate);
            if (checkStatus.serverChange) {
              const mergedLog = processLog(log, checkStatus, syncDate);
              commit('updateLog', {
                index: checkStatus.storeIndex,
                props: mergedLog,
              });
            }
          });
        })
        .catch((err) => {
          if (err.response) {
            throw new SyncError({
              responses: [{
                status: err.response.status,
                message: err.response.statusText,
              }],
            });
          } else {
            throw new SyncError({
              responses: [{ message: err }],
            });
          }
        });
    },
    syncAllLogs({ rootState, commit, dispatch }) {
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
            const allAssets = rootState.farm.assets;
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
              commit('logError', errorPayload);
              // Stop spinner on aborted sync attempts by setting isReadyToSync false
              commit('updateLog', {
                index,
                props: {
                  isReadyToSync: false,
                },
              });
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
        This handles the custom error type defined in ./sync.js,
        thrown by getServerLogs and sendLogs
      */
      function handleSyncError(syncError) {
        // First set all logs to not ready to sync so their spinners stops spinning
        commit('updateAllLogs', log => ({ ...log, isReadyToSync: false }));
        // Create a message string that we will build out as we go.
        let errMsg = '';
        // Build a message from sendLogs errors, which have an index
        syncError.responses.forEach((response) => {
          if (response.status === 401
            || response.status === 403
            || response.status === 404) {
            // 401, 403 and 404 errors indicate bad credentials - push to login
            router.push('/login');
          } else if (response.status === undefined) {
            // If there's no status code, it's probably a Network Error; print as is.
            errMsg += response.message;
          } else if (response.index === undefined) {
            // If response.index is undefined, the error was thrown by a getServerLogs request
            errMsg += `${response.status} error: ${response.message}`;
          } else {
            // Otherwise, the error was thrown by a sendLogs request
            const logName = rootState.farm.logs[response.index].name.data;
            errMsg += `${response.status} error while syncing "${logName}" <br>`;
          }
        });
        if (errMsg !== '') {
          // Display an error if there is message text
          const errorPayload = {
            message: errMsg,
            errorCode: '',
            level: 'warning',
            show: true,
          };
          commit('logError', errorPayload);
        }
      }

      // Sync logs with the server, unless the user isn't logged in
      if (localStorage.getItem('token')) {
        // First set all local logs ready to sync
        commit('updateAllLogs', log => ({ ...log, isReadyToSync: true }));
        // Get and process logs from the server in httpModule
        dispatch('getServerLogs')
          .then(() => {
            // Save the current time as the most recent syncDate
            localStorage.setItem('syncDate', (Date.now() / 1000).toFixed(0));
            // After getServerLogs finishes, we send logs with isReadyToSync true to the server
            const indices = rootState.farm.logs.reduce(syncReducer, []);
            return dispatch('sendLogs', indices);
          })
          // Handle syncErrors thrown by getServerLogs
          .catch(handleSyncError);
      } else {
        router.push('/login');
      }
    },
  },
};
