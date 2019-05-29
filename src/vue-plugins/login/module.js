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
            message: `Unable to reach the server. Please check that you have the correct URL and that your device has a network connection. Status: ${error.status}`,
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
      lazyFarm().logout().then((res) => {
        // Currently farmOS.js returns no response to logout requests
      });
    },

    updateUserAndSiteInfo({ commit }) {
      const username = localStorage.getItem('username');
      if (username) {
        // Request user and site info if the user is logged in
        lazyFarm().info().then((res) => {
          commit('changeFarmName', res.name);
          commit('changeFarmUrl', res.url);
          commit('changeUsername', res.user.name);
          commit('changeEmail', res.user.mail);
          commit('changeUid', res.user.uid);
          commit('setLoginStatus', true);
          localStorage.setItem('farmName', res.name);
          localStorage.setItem('username', res.user.name);
          localStorage.setItem('email', res.user.mail);
          localStorage.setItem('uid', res.user.uid);
          localStorage.setItem('isLoggedIn', true);
        });
      }
    },

    loadCachedUserAndSiteInfo({ commit }) {
      commit('changeUsername', localStorage.getItem('username'));
      commit('changeEmail', localStorage.getItem('email'));
      // Fixed this - was previously getting username on changeUid
      commit('changeUid', localStorage.getItem('uid'));
      commit('setLoginStatus', localStorage.getItem('isLoggedIn'));
      commit('changeFarmName', localStorage.getItem('farmName'));
      commit('changeFarmUrl', localStorage.getItem('host'));
      if (localStorage.getItem('useGeolocation')) {
        // LocalStorage saves only strings, not booleans.
        // We need to save to the app store as a boolean
        if (localStorage.getItem('useGeolocation') === 'true') {
          commit('setUseGeolocation', true);
        } else {
          commit('setUseGeolocation', false);
        }
      }
    },

    deleteCachedUserAndSiteInfo() {
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('username');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('farmName');
      localStorage.removeItem('host');
      localStorage.removeItem('useGeolocation');
    },
  },
};
