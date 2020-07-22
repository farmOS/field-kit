import farm, { setHost } from './farmClient';

export default {
  actions: {

    authorize({ commit }, payload) {
      const url = (process.env.NODE_ENV === 'development')
        ? ''
        : `https://${payload.farmosUrl}`;
      const { username, password, router } = payload;
      const storage = window.localStorage;
      setHost(url);

      function handleLoginError(error) {
        if (error.status === 401) {
          const resetUrl = `${url}/user/password`;
          const errorPayload = {
            message: `The username or password you entered was incorrect. Please try again, or <a href="${resetUrl}">reset your password</a>.`,
            errorCode: error.statusText,
            level: 'warning',
            show: true,
          };
          commit('logError', errorPayload);
        } else if (error.status === 400) {
          let errorMessage = `The OAuth Password Authorization flow failed. Error message: ${error.data.error_description}`;

          if (error.data.error === 'invalid_client') {
            const oauthConfigUrl = `${url}/admin/config/farm/oauth`;
            errorMessage = `The OAuth client for farmOS Field Kit is not enabled on your farmOS server. Enable it <a href=${oauthConfigUrl}>here</a>.`;
          }
          // Other OAuth related errors.
          const errorPayload = {
            message: errorMessage,
            errorCode: error.statusText,
            level: 'warning',
            show: true,
          };
          commit('logError', errorPayload);
        } else {
          const errorPayload = {
            message: `Unable to reach the server. Please check that you have the correct URL and that your device has a network connection. Status: ${error.message}`,
            errorCode: error.statusText,
            level: 'warning',
            show: true,
          };
          commit('logError', errorPayload);
        }
      }

      // Return a promise so the component knows when the action completes.
      return new Promise((resolve) => {
        farm().authorize(username, password)
          .then((tokenResponse) => {
            // Save our host and token to the persistant store.
            setHost(url);
            storage.setItem('host', url);
            storage.setItem('token', JSON.stringify(tokenResponse));

            // Go back 1 page, or reroute to home page
            if (window.history.length > 1) {
              window.history.back();
              resolve();
              return;
            }
            router.push('/');
            resolve();
          })
          .catch((error) => {
            const err = error.response ? error.response : error;
            handleLoginError(err);
            resolve();
          });
      });
    },

    logout({ commit }) {
      farm().revokeTokens().then((success) => {
        if (!success) {
          const errorPayload = {
            message: 'Unable to reach the server. Access tokens have been cleared locally, but were not revoked fromt the farmOS server.',
            errorCode: 'Revoke Error',
            level: 'warning',
            show: true,
          };
          commit('logError', errorPayload);
        }
      });
    },

    updateUserAndSiteInfo({ commit }) {
      const token = localStorage.getItem('token');
      const safeSet = (key, mutation, response) => {
        let value;
        if (typeof response === 'string') {
          value = response;
        }
        if (typeof response === 'object'
          || typeof response === 'number'
          || typeof response === 'boolean') {
          value = JSON.stringify(response);
        }
        // Explicit reassignment here b/c `typeof null === 'object'`.
        if (response === null) {
          value = undefined;
        }
        if (value) {
          localStorage.setItem(key, value);
          commit(mutation, response);
        }
      };
      if (token) {
        // Request user and site info if the user is logged in
        farm().info().then((res) => {
          safeSet('farmName', 'changeFarmName', res.name);
          safeSet('username', 'changeUsername', res.user?.name);
          safeSet('email', 'changeEmail', res.user?.mail);
          safeSet('uid', 'changeUid', res.user?.uid);
          safeSet('mapboxAPIKey', 'changeMapboxAPIKey', res.mapbox_api_key);
          safeSet('systemOfMeasurement', 'changeSystemOfMeasurement', res.system_of_measurement);
          safeSet('logTypes', 'changeLogTypes', res.resources?.log);
          safeSet('isLoggedIn', 'setLoginStatus', true);

          // Just add the url to store so the main menu can display it correctly,
          // but don't overwrite localStorage b/c that url needs to be set by the
          // login procedure, otherwise login breaks in the dev env.
          if (res.url) {
            commit('changeFarmUrl', res.url);
          }
        });
        farm().area.geojson().then((geojson) => {
          safeSet('areaGeoJSON', 'setAreaGeoJSON', geojson);
        });
      }
    },

    loadCachedUserAndSiteInfo({ commit }) {
      // Helper so we don't overwrite defaults if the key isn't in LS.
      const safeLoad = (mutation, key) => {
        let value;
        try {
          value = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          value = localStorage.getItem(key);
        }
        if (value) {
          commit(mutation, value);
        }
      };

      safeLoad('changeUsername', 'username');
      safeLoad('changeEmail', 'email');
      safeLoad('changeUid', 'uid');
      safeLoad('changeMapboxAPIKey', 'mapboxAPIKey');
      safeLoad('changeSystemOfMeasurement', 'systemOfMeasurement');
      safeLoad('setLoginStatus', 'isLoggedIn');
      safeLoad('changeFarmName', 'farmName');
      safeLoad('changeFarmUrl', 'host');
      safeLoad('changeLogTypes', 'logTypes');
      safeLoad('setUseGeolocation', 'useGeolocation');
      safeLoad('setAreaGeoJSON', 'areaGeoJSON');
    },

    deleteCachedUserAndSiteInfo({ commit }) {
      commit('changeFarmName', '');
      commit('changeFarmUrl', '');
      commit('changeUsername', '');
      commit('changeEmail', '');
      commit('changeUid', '');
      commit('changeMapboxAPIKey', '');
      commit('changeSystemOfMeasurement', 'metric');
      commit('setLoginStatus', false);
      commit('setAreaGeoJSON', { type: 'FeatureCollection', features: [] });
      localStorage.clear();
    },
  },
};
