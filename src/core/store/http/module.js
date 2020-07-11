import farm from '@/core/store/farmClient';
import Promise from 'core-js-pure/features/promise';
import router from '@/core/router';
import farmLog from '@/utils/farmLog';
import {
  SyncError, createSyncReducer,
} from './sync';

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
        if (cur.filters.log.log_owner === 'SELF' && rootState.shell.user.uid) {
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
        commit('addAssets', res.list);
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

    // SEND LOGS TO SERVER (step 2 of sync)
    sendLogs({ commit, rootState }, indices) {
      const { updateLog, formatLogForServer } = farmLog(rootState.shell.logTypes);
      // Update logs in the database and local store after send completes
      function handleSyncResponse(response, index) {
        const props = {
          id: response.id,
          url: response.uri,
          wasPushedToServer: true,
          isReadyToSync: false,
          isCachedLocally: false,
        };
        const updatedLog = updateLog(rootState.farm.logs[index], props);
        commit('addLogs', updatedLog);
      }
      return Promise.allSettled(
        indices.map((index) => {
          const newLog = formatLogForServer(rootState.farm.logs[index]);
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
      const syncDate = JSON.parse(localStorage.getItem('syncDate'));
      const { mergeLogFromServer } = farmLog(rootState.shell.logTypes, syncDate);
      return farm().log.get(getters.logFilters)
        .then((res) => {
          // Filter over the response to eliminate server logs that haven't
          // changed since the last successful sync event.
          res.list.filter(log => log.changed > syncDate).forEach((serverLog) => {
            const localLog = rootState.farm.logs.find(log => +log.id === +serverLog.id);
            if (localLog !== undefined) {
              const modules = Array.from(
                new Set(localLog.modules.concat(rootState.shell.currentModule)),
              );
              const props = { modules, isCachedLocally: false };
              const mergedLog = mergeLogFromServer(serverLog, localLog, props);
              commit('addLogs', mergedLog);
            } else {
              const modules = [rootState.shell.currentModule];
              const formattedLog = mergeLogFromServer(serverLog, undefined, { modules });
              dispatch('initializeLog', formattedLog);
            }
          });
          // Return an array of ids that have already been checked & merged.
          return res.list.map(serverLog => +serverLog.id);
        })
        // Run a 2nd request for the remaining logs not included in the import filters
        .then((checkedIds) => {
          const uncheckedIds = rootState.farm.logs
            .filter(log => log.id && !checkedIds.some(checkedId => +log.id === +checkedId))
            .map(log => log.id);
          return farm().log.get(uncheckedIds);
        })
        .then((res) => {
          res.list.filter(log => log.changed > syncDate).forEach((serverLog) => {
            const localLog = rootState.farm.logs.find(log => +log.id === +serverLog.id);
            const mergedLog = mergeLogFromServer(serverLog, localLog);
            commit('addLogs', mergedLog);
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
      const { updateLog } = farmLog(rootState.shell.logTypes);
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
            || response.status === 403) {
            // 401 and 403 errors indicate bad credentials - push to login
            router.push('/login');
          } else if (response.status === undefined) {
            // If there's no status code, it's probably a Network Error; print as is.
            errMsg += response.message;
          } else if (response.index === undefined) {
            // If response.index is undefined, the error was thrown by a getServerLogs request
            errMsg += `${response.status} error: ${response.message}`;
          } else if (response.status !== 404) {
            /*
              Otherwise, either the error was thrown by a sendLogs request, or it is a 404.
              If the error was thrown by sendLogs, display the log name and error message.
              If the error is a 404, this means the log was deleted on the server.
              We are keeping 404 errors silent for now.
            */
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
              logTypes: rootState.shell.logTypes,
            });
            // Process and sort the logs into syncable and unsyncable logs,
            // as well as updates needed before syncing.
            const [syncables, unsyncables, updates] = rootState.farm.logs
              .reduce(syncReducer, [[], [], []]);
            // For all logs that are unsyncable, display an error message.
            unsyncables.forEach(({ message, index }) => {
              if (message) {
                commit('logError', {
                  message,
                  level: 'warning',
                  show: true,
                });
              }
              const updatedLog = updateLog(
                rootState.farm.logs[index],
                { isReadyToSync: false },
              );
              commit('addLogs', updatedLog);
            });
            // Before syncing, commit all necessary updates.
            updates.forEach(({ index, props }) => {
              const updatedLog = updateLog(rootState.farm.logs[index], props);
              commit('addLogs', updatedLog);
            });
            // Finally, send all logs that are syncable.
            return dispatch('sendLogs', syncables);
          })
          // Handle syncErrors thrown by getServerLogs
          .catch(handleSyncError)
          .finally(() => {
            commit('updateAllLogs', log => ({ ...log, isReadyToSync: false }));
          });
      } else {
        router.push('/login');
      }
    },
  },
};
