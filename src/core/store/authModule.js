import farmOS from 'farmos';

const lazyFarm = () => {
  const host = localStorage.getItem('host');
  const user = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  return farmOS(host, user, password);
};

export default {
  actions: {

    didSubmitCredentials({ commit }, payload) {
      const url = (process.env.NODE_ENV === 'development')
        ? ''
        : `https://${payload.farmosUrl}`;
      const { username, password, router } = payload;
      const storage = window.localStorage;

      function handleLoginError(error) {
        if (error.status === 403) {
          const resetUrl = `${url}/user/password`;
          const errorPayload = {
            message: `The username or password you entered was incorrect. Please try again, or <a href="${resetUrl}">reset your password</a>.`,
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
        const farm = farmOS(url, username, password);
        farm.authenticate()
          .then((tokenResponse) => {
            // Save our username, password & token to the persistant store
            storage.setItem('host', url);
            storage.setItem('username', username);
            storage.setItem('password', password);
            storage.setItem('token', tokenResponse);

            // Go back 1 page, or reroute to home page
            if (window.history.length > 1) {
              window.history.back();
              resolve();
              return;
            }
            router.push('/');
            resolve();
          })
          .catch(() => {
            // Check if the login attempt failed b/c it's http://, not https://
            const noSslUrl = `http://${payload.farmosUrl}`;
            const noSslfarm = farmOS(noSslUrl, username, password);
            noSslfarm.authenticate() // eslint-disable-line
              .then((tokenResponse) => {
                // Save our username, password & token to the persistant store
                storage.setItem('host', noSslUrl);
                storage.setItem('username', username);
                storage.setItem('password', password);
                storage.setItem('token', tokenResponse);

                // Go back 1 page, or reroute to home page
                if (window.history.length > 1) {
                  window.history.back();
                  resolve();
                  return;
                }
                router.push('/');
                resolve();
              }).catch((error) => {
                handleLoginError(error);
                resolve();
              });
          });
      });
    },

    logout() {
      lazyFarm().logout().then(() => {
        // Currently farmOS.js returns no response to logout requests
      });
    },

    updateUserAndSiteInfo({ commit }) {
      const username = localStorage.getItem('username');
      if (username) {
        // Request user and site info if the user is logged in
        lazyFarm().info().then((res) => {
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
      localStorage.clear();
    },
  },
};
