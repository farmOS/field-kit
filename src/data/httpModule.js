import logFactory, { SERVER } from './logFactory';
import farmSync from './farmSync';

// const host = localStorage.getItem('url');
// const user = localStorage.getItem('user');
// const password = localStorage.getItem('password');
const host = '';
const user = 'farmos';
const password = 'farmos';

const farm = farmSync(host, user, password);

export default {
  actions: {
    getAreas() {
      farm.area.get().then(console.log).catch(console.error);
    },
    getAssets() {
      farm.asset.get().then(console.log).catch(console.error);
    },
    getLogs() {
      farm.log.get().then(console.log).catch(console.error);
    },
    authenticate() {
      farm.authenticate()
        .then(console.log).catch(console.error);
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
          return farm.log.send(newLog, localStorage.getItem('token')) // eslint-disable-line no-use-before-define, max-len
            .then(res => handleSyncResponse(res, index))
            .catch(err => handleSyncError(err, index));
        });
      } else {
        payload.router.push('/login');
      }
    },

  },
};
