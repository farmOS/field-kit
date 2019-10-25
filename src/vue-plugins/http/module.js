import farmOS from 'farmos';
import Promise from 'core-js-pure/features/promise';
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
            wasPushedToServer: true,
            isReadyToSync: false,
            remoteUri: response.uri,
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
  },
};
