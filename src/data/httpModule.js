import logFactory, { SERVER } from './logFactory';

export default {
  actions: {

    // SEND RECORDS TO SERVER
    pushToServer({ commit, rootState }, payload) {
      const storage = window.localStorage;
      const storedUrl = storage.getItem('url');
      const storedToken = storage.getItem('token');

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
      if (rootState.user.isLoggedIn === true) {
        payload.indices.map(index => (
          pushRecord(storedUrl, storedToken, rootState.farm.logs[index]) // eslint-disable-line no-use-before-define, max-len
            .then(res => handleSyncResponse(res, index))
            .catch(err => handleSyncError(err, index))
        ));
      } else {
        commit('setStatusText', 'Not logged in. Redirecting to login page...');
        // FIXME: This should probably done from within the client's AllObservations.vue,
        // but only after the login module's store has been reintegrated with client.
        payload.router.push('/login');
      }
    },

  },
};


// Executes AJAX to send records to server
function pushRecord(url, token, log) {
  const loc = '/log';
  const logUrl = url + loc;
  const formattedLog = logFactory(log, SERVER);
  const requestHeaders = {
    'X-CSRF-Token': token,
    'Content-Type': 'application/json',
    Accept: 'json',
  };
  console.log(`PUSHING REQUEST URL : ${logUrl}`);
  console.log('RECORDS SENDING: ', JSON.stringify(formattedLog));
  return new Promise((resolve, reject) => {
    fetch(logUrl, {
      method: 'POST',
      headers: requestHeaders,
      credentials: 'include',
      body: JSON.stringify(formattedLog),
    }).then((response) => {
      console.log('fetch response: ', response);
      if (!response.ok) {
        throw response;
      }
      return response.json();
    }).then(resolve).catch(reject);
  });
}
