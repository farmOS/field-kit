import logFactory, { SERVER } from './logFactory';
import farmSync from './farmSync';

const farm = () => {
  const host = localStorage.getItem('host');
  const user = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  return farmSync(host, user, password);
};

export default {
  actions: {
    updateAreas({ commit }) {
      return farm().area.get().then((res) => {
        // If a successful response is received, delete and replace all areas
        commit('deleteAllAreas');
        const areas = res.map(({ tid, name, field_farm_geofield }) => ({ tid, name, field_farm_geofield })); // eslint-disable-line camelcase, max-len
        commit('addAreas', areas);
        console.log('Finished updating areas!');
      }).catch((err) => { throw err; });
    },
    updateAssets({ commit }) {
      return farm().asset.get().then((res) => {
        // If a successful response is received, delete and replace all assets
        commit('deleteAllAssets');
        const assets = res.map(({ id, name }) => ({ id, name }));
        commit('addAssets', assets);
        console.log('Finished updating assets!');
      }).catch((err) => { throw err; });
    },

    // SEND LOGS TO SERVER
    sendLogs({ commit, rootState }, payload) {
      function handleSyncResponse(response, index) {
        commit('updateLogs', {
          indices: [index],
          mapper(log) {
            return logFactory({
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
            message: `Unable to sync "${rootState.farm.logs[index].name}" because the network is currently unavailable. Please try syncing again later.`,
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
            message: `${error.status} error while syncing "${rootState.farm.logs[index].name}": ${error.statusText}`,
            errorCode: error.statusText,
            level: 'warning',
            show: true,
          };
          commit('logError', errorPayload);
        }
        commit('updateLogs', {
          indices: [index],
          mapper(log) {
            return logFactory({
              ...log,
              isReadyToSync: false,
            });
          },
        });
      }

      // Send records to the server, unless the user isn't logged in
      if (localStorage.getItem('token')) {
        payload.indices.map((index) => {
          const newLog = logFactory(rootState.farm.logs[index], SERVER);
          return farm().log.send(newLog, localStorage.getItem('token')) // eslint-disable-line no-use-before-define, max-len
            .then(res => handleSyncResponse(res, index))
            .catch(err => handleSyncError(err, index));
        });
      } else {
        payload.router.push('/login');
      }
    },

    // GET LOGS FROM SERVER
    getServerLogs({ commit, rootState }, payload) {
      console.log(`GET SERVER LOGS CALLED IN HTTPMODULE WITH ${payload}`);
      return farm().log.get(payload, localStorage.getItem('token'))
        .then((res) => {
          console.log('LOGS RECEIVED AS ', res);

         // If receiving a single log, run it through the logFactory and call addLog
         // If receiving multiple, run each through logFactory and call addLogs
          if (res.list) {
            // Currently, addLogs does not save logs to the DB.
            // const gotLogs = [];
            res.list.forEach((log) => {
              // gotLogs.push(logFactory(log))
              commit('addLog', logFactory({
                ...log,
                wasPushedToServer: true,
              }));
            });
            // commit('addLogs', gotLogs);
          } else {
            // commit('addLog', logFactory(res));
            commit('addLog', logFactory({
              ...res,
              wasPushedToServer: true,
            }));
          }
        })
        .catch((err) => { throw err; });
      // Errors are handled in index.js
    },

  },
};
