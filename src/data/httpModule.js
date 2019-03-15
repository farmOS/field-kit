import farmOS from 'farmos';
import makeLog from '../utils/makeLog';

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

    // SEND LOGS TO SERVER
    sendLogs({ commit, rootState }, payload) {
      // Update logs in the database and local store after send completes
      function handleSyncResponse(response, index) {
        const nowStamp = (Date.now() / 1000).toFixed(0);
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

      // Send records to the server, unless the user isn't logged in
      if (localStorage.getItem('token')) {
        payload.indices.map((index) => { // eslint-disable-line consistent-return, array-callback-return, max-len
          // Either send or post logs, depending on whether they originated on the server
          // Logs originating on the server possess an ID field; others do not.
          const newLog = makeLog.toServer(rootState.farm.logs[index]);
          // I need to check wasPushedToServer, which is not in logFactory Server
          const synced = rootState.farm.logs[index].wasPushedToServer.data;
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

    // GET LOGS FROM SERVER
    getServerLogs({ commit, rootState }) {
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
            const logStatus = { localId: null, storeIndex: null, localChange: true };
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
                  if (localLog.wasPushedToServer.data) {
                    logStatus.localChange = false;
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
            against the date of the last sync
             - If the log.changed is before the syncDate, keep the verson on the app.
             - If the log was changed more recently than syncDate, throw a warning
             and let the user decide what to do
            */
            if (checkStatus.localId === null) {
              commit('addLogFromServer',
                makeLog.fromServer({
                  ...log,
                  wasPushedToServer: true,
                }));
            } else if (!checkStatus.localChange) {
              // Update the log with all data from the server
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
            } else {
              const syncDate = localStorage.getItem('syncDate');
              /*
              I will need to iterate through each prop individually
              I can either build an update, or do a fresh update for each
              The former is better.
              Better still, bring all this into checkLog
              */
              if (log.changed > syncDate) {
                /*
                  Throw a warning with two options:
                   - Keep what I have on the app, and over-write what I have on the server
                   - Keep what I have on the server, and over-write what I have on the app
                  If the user selects the first option, stop here.
                  If the user selects the second option, execute the following:
                */
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
              }
              // If the log on the server hasn't been changed, do nothing
              // The local log will over-write whatever is on the server on sendLogs
            }
          }
          // Process one or more logs
          if (res.list) {
            res.list.forEach(log => processLog(log));
          } else {
            processLog(res);
          }
        })
        .catch(err => err);
      // Errors are handled in index.js
    },

  },
};
