import farmOS from 'farmos';
import makeLog from '@/utils/makeLog';

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
        const areas = res.map(({ tid, name, geofield }) => ({ tid, name, geofield })); // eslint-disable-line camelcase, max-len
        commit('addAreas', areas);
      }).catch((err) => { throw err; });
    },
    updateAssets({ commit }) {
      return farm().asset.get().then((res) => {
        // If a successful response is received, delete and replace all assets
        commit('deleteAllAssets');
        const assets = res.map(({ id, name, type }) => ({ id, name, type }));
        commit('addAssets', assets);
      }).catch((err) => { throw err; });
    },
    updateUnits({ commit }) {
      // Return units only.
      return farm().term.get('farm_quantity_units').then((res) => {
        commit('deleteAllUnits');
        const units = res.list.map(({ tid, name }) => ({ tid, name }));
        commit('addUnits', units);
      }).catch((err) => { throw err; });
    },
    // SEND LOGS TO SERVER (step 2 of sync)
    sendLogs({ commit, rootState }, payload) {
      // Update logs in the database and local store after send completes
      function handleSyncResponse(response, index) {
        commit('updateLogs', {
          indices: [index],
          mapper(log) {
            return makeLog.create({
              ...log,
              id: response.id,
              wasPushedToServer: true,
              remoteUri: response.uri,
            });
          },
        });
      }

      function handleSyncError(error, index) {
        // Do something with a TypeError object (mostly likely no connection)
        if (typeof error === 'object' && error.status === undefined) {
          const errorPayload = {
            message: `Unable to sync "${rootState.farm.logs[index].name.data}" because the network is currently unavailable. Please try syncing again later.`,
            errorCode: error.statusText,
            level: 'warning',
            show: true,
          };
          commit('logError', errorPayload);
        } else if (error.status === 401 || error.status === 403) {
          // Reroute authentication or authorization errors to login page
          payload.router.push('/login');
        } else {
          // handle some other type of runtime error (if possible)
          const errorPayload = {
            message: `${error.status} error while syncing "${rootState.farm.logs[index].name.data}": ${error.statusText}`,
            errorCode: error.statusText,
            level: 'warning',
            show: true,
          };
          commit('logError', errorPayload);
        }
        commit('updateLogs', {
          indices: [index],
          mapper(log) {
            return makeLog.create({
              ...log,
              isReadyToSync: false,
            });
          },
        });
      }

      // format images for the payload
      function processImages(image) {
        if (Array.isArray(image)) {
          const imgArray = [];
          image.forEach((img) => {
            // Files begin with 'data:'.  Retain file strings, turn ref strings into objects
            if (img.charAt(0) === 'd') {
              imgArray.push(img);
            } else {
              imgArray.push({ fid: img });
            }
          });
          return imgArray;
        }
        return image;
      }

      // Send records to the server, unless the user isn't logged in
      if (localStorage.getItem('token')) {
        payload.indices.map((index) => { // eslint-disable-line consistent-return, array-callback-return, max-len
          // Either send or post logs, depending on whether they originated on the server
          // Logs originating on the server possess an ID field; others do not.
          const newLog = makeLog.toServer(rootState.farm.logs[index]);
          newLog.images = processImages(newLog.images);
          newLog.done = newLog.done ? 1 : 0;
          // I need to check wasPushedToServer, which is not in logFactory Server
          const synced = rootState.farm.logs[index].wasPushedToServer;
          if (!synced) {
            return farm().log.send(newLog, localStorage.getItem('token')) // eslint-disable-line no-use-before-define, max-len
              .then(res => handleSyncResponse(res, index))
              .catch(err => handleSyncError(err, index));
          }
        });
      } else {
        payload.router.push('/login');
      }
    },

    // GET LOGS FROM SERVER (step 1 of sync)
    getServerLogs({ commit, rootState }) {
      const syncDate = localStorage.getItem('syncDate');
      return farm().log.get(rootState.shell.settings.logFilters, localStorage.getItem('token'))
        .then((res) => {
          // See whether logs are new, or currently in the store
          // If res is a single log, check vs current, run through the logFactory and call addLog
          // If res is multiple, check each vs current, run through logFactory and call addLogs
          // Returns the log index number as logIndex if the log is present; null if not
          /*
          Logs from the server are either saved as new (with isReadyToSync false)
          Used to over-write local logs (with isReadyToSync fasle)
          OR, if the local log has been modified since the last sync, a notification
          is thrown, and the user selects whether to over-write or sync local to server
          */

          function checkLog(serverLog) {
            const allLogs = rootState.farm.logs;
            // The localLog will be passed as logStatus.log if localChange checks true
            const logStatus = {
              localId: null,
              storeIndex: null,
              localChange: true,
              serverChange: false,
              log: null,
            };
            allLogs.forEach((localLog, index) => {
              if (localLog.id) {
                /*
                  If a local log has an id field, see if it is the same as the server log.
                  In this case set lotStatus.localId and .storeIndex
                  Also check whethe the log is unsynced (wasPushedToServer true)
                */
                if (localLog.id === serverLog.id) {
                  logStatus.localId = localLog.local_id;
                  logStatus.storeIndex = index;
                  if (JSON.parse(localLog.wasPushedToServer) === true) {
                    logStatus.localChange = false;
                  } else {
                    logStatus.log = localLog;
                  }
                  if (parseInt(serverLog.changed, 10) > parseInt(syncDate, 10)) {
                    logStatus.serverChange = true;
                  }
                }
              }
            });
            return logStatus;
          }

          // Process each log on its way from the server to the logFactory
          function processLog(log) {
            const checkStatus = checkLog(log);
            /*
            If the log is not present locally, add it.
            If the log is present locally, but has not been changed since the last sync,
            update it with the new version from the server
            If the log is present locally and has been changed, check log.changed from the server
            against the changed property of each log attribute
             - If any attribute has been changed more recently than the server log, keep it
             - Otherwise take changes from the server
            */
            if (checkStatus.localId === null) {
              commit('addLogFromServer',
                makeLog.fromServer({
                  ...log,
                  wasPushedToServer: true,
                  // Trying to make isReady..
                  isReadyToSync: false,
                  done: (parseInt(log.done, 10) === 1),
                }));
            }
            if (!checkStatus.localChange && checkStatus.localId !== null && checkStatus.serverChange) { // eslint-disable-line max-len
              // Update the log with all data from the server
              const updateParams = {
                index: checkStatus.storeIndex,
                log: makeLog.fromServer({
                  ...log,
                  wasPushedToServer: true,
                  isReadyToSync: false,
                  local_id: checkStatus.localId,
                  done: (parseInt(log.done, 10) === 1),
                }),
              };
              commit('updateLogFromServer', updateParams);
            }
            if (checkStatus.localChange && checkStatus.localId !== null && checkStatus.serverChange) { // eslint-disable-line max-len
              /*
              Replace properties of the local log that have not been modified since
              the last sync with data from the server.
              For properties that have been completed since the sync date,
              Present choice to retain either the log or the server version
              */
              const storeLog = checkStatus.log;
              const servLogBuilder = {};
              const locLogBuilder = {};
              /*
              We compare changed dates for local log properties against the date of last sync.
              madeFromServer is used as a source
              for building the merged log, to keep formatting consistent
              */
              const madeFromServer = makeLog.fromServer({ ...log });
              Object.keys(storeLog).forEach((key) => {
                if (storeLog[key].changed && storeLog[key].changed !== null) {
                  if (parseInt(storeLog[key].changed, 10) < parseInt(syncDate, 10)) {
                    servLogBuilder[key] = madeFromServer[key];
                  } else {
                    locLogBuilder[key] = storeLog[key];
                  }
                }
              });
              /*
              This is where we can optionally throw a warning about log attributes
              that have been changed since last sync on both the app and the server.
               - If retaining local field changes, run the following uncommented code
               - If discarding local field changes, run this commented code
               const updateParams = {
                 index: checkStatus.storeIndex,
                 log: makeLog.fromServer({
                   ...log,
                   wasPushedToServer: true,
                   isReadyToSync: false,
                   local_id: checkStatus.localId,
                 }),
               };
               commit('updateLogFromServer', updateParams);
              */
              if (locLogBuilder !== {}) {
                const updateParams = {
                  index: checkStatus.storeIndex,
                  log: makeLog.toStore({
                    ...locLogBuilder,
                    ...servLogBuilder,
                    wasPushedToServer: false,
                    local_id: checkStatus.localId,
                    id: log.id,
                    done: (parseInt(log.done, 10) === 1),
                  }),
                };
                updateParams.log.isReadyToSync = true;
                commit('updateLogFromServer', updateParams);
              }
            }
          }
          // Process one or more logs
          if (res.list) {
            res.list.forEach(log => processLog(log));
          } else if (Array.isArray(res)) {
            res.forEach(log => processLog(log));
          } else {
            processLog(res);
          }
        })
        .catch(err => err);
      // Errors are handled in index.js
    },
  },
};
