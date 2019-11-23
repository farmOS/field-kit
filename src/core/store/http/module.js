import farmOS from 'farmos';
import Promise from 'core-js-pure/features/promise';
import router from '@/core/router';
import makeLog from '@/utils/makeLog';
import {
  SyncError, createSyncReducer, checkLog, processLog,
} from './sync';

const farm = () => {
  const host = localStorage.getItem('host');
  const user = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  return farmOS(host, user, password);
};

export default {
  getters: {
    logFilters: (state, getters, rootState) => rootState.shell.modules
      .filter(mod => mod.name === rootState.shell.currentModule)
      .reduce((_, cur) => {
        // A nullish value represents the case where no request should be made.
        if (!cur.filters || !cur.filters.log) { return null; }

        // If any of these var's gets set to undefined, its corresponding query
        // parameter will be ommitted in the ultimate GET request to the server.
        let logOwner; let type; let done;

        // Return undefined for all values if the 'ALL' keyword is provided.
        if (cur.filters.log === 'ALL') {
          return { log_owner: logOwner, type, done };
        }

        // LOG_OWNER
        if (cur.filters.log.log_owner === 'SELF') {
          logOwner = rootState.shell.user.uid;
        } else if (typeof cur.filters.log.log_owner === 'number') {
          logOwner = cur.filters.log.log_owner;
        } else {
          logOwner = undefined;
        }

        // TYPE
        if (cur.filters && cur.filters.log && Array.isArray(cur.filters.log.type)) {
          type = cur.filters.log.type; // eslint-disable-line prefer-destructuring
        } else {
          type = undefined;
        }

        // DONE
        if (cur.filters.log.done === 0 || cur.filters.log.done === false) {
          done = 0;
        } else if (cur.filters.log.done === 1 || cur.filters.log.done === true) {
          done = 1;
        } else {
          done = undefined;
        }

        return { log_owner: logOwner, done, type };
      }, {}),
  },
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
              return errors.concat({
                index: indices[arrayIndex],
                status: parseInt(promise.reason.message.substr(-3), 10),
                message: promise.reason.response.data,
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
    getServerLogs({
      commit, getters, dispatch, rootState,
    }) {
      const syncDate = localStorage.getItem('syncDate');
      const allLogs = rootState.farm.logs;
      return farm().log.get(getters.logFilters)
        .then(res => (
          // Returns an array of ids which have already been checked & merged
          res.list.map((log) => {
            const checkStatus = checkLog(log, allLogs, syncDate);
            const modules = checkStatus.log
              ? Array.from(new Set(checkStatus.log.modules.concat(rootState.shell.currentModule)))
              : [rootState.shell.currentModule];
            if (!checkStatus.serverChange && checkStatus.localId) {
              commit('updateLog', {
                index: checkStatus.storeIndex,
                props: { modules, isCachedLocally: false },
              });
            }
            if (checkStatus.serverChange && checkStatus.localId) {
              const mergedLog = processLog(log, checkStatus, syncDate);
              commit('updateLog', {
                index: checkStatus.storeIndex,
                props: { ...mergedLog, modules },
              });
            }
            if (checkStatus.localId === null) {
              const mergedLog = processLog(log, checkStatus, syncDate);
              dispatch('initializeLog', { ...mergedLog, modules });
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
            errMsg += `Error while syncing "${logName}": ${response.message} <br>`;
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
            const syncReducer = createSyncReducer({
              assets: rootState.farm.assets,
            });
            const [syncables, unsyncables] = rootState.farm.logs.reduce(syncReducer, [[], []]);
            unsyncables.forEach(({ message, index }) => {
              if (message) {
                commit('logError', {
                  message,
                  level: 'warning',
                  show: true,
                });
              }
              commit('updateLog', {
                index,
                props: {
                  isReadyToSync: false,
                },
              });
            });
            return dispatch('sendLogs', syncables);
          })
          // Handle syncErrors thrown by getServerLogs
          .catch(handleSyncError);
      } else {
        router.push('/login');
      }
    },
  },
};
