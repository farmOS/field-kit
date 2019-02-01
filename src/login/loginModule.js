import farmSync from '../data/farmSync';

const lazyFarm = () => {
  const host = localStorage.getItem('host');
  const user = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  return farmSync(host, user, password);
};

export default {
  actions: {

    didSubmitCredentials({ commit }, payload) {
      console.log('RUNNING didSubmitCredentials');
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
          console.log(`Server response: ${error.status}`);
          commit('logError', errorPayload);
        }
      }

      // Return a promise so the component knows when the action completes.
      return new Promise((resolve) => {
        const farm = farmSync(url, username, password);
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
            const noSslfarm = farmSync(noSslUrl, username, password);
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

    updateUserInfo({ commit }) {
      const username = localStorage.getItem('username');
      lazyFarm().user(username).then((res) => {
        commit('changeUsername', res.list[0].name);
        commit('changeEmail', res.list[0].mail);
        commit('changeUid', res.list[0].uid);
        commit('setLoginStatus', true);
        localStorage.setItem('username', res.list[0].name);
        localStorage.setItem('email', res.list[0].mail);
        localStorage.setItem('uid', res.list[0].uid);
        localStorage.setItem('isLoggedIn', true);
      });
    },

    updateSiteInfo({ commit }) {
      const username = localStorage.getItem('username');
      lazyFarm().info(username).then((res) => {
        commit('changeFarmName', res.name);
        commit('changeFarmUrl', res.url);
        localStorage.setItem('farmName', res.name);
      });
    },

    loadCachedUserAndSiteInfo({ commit }) {
      commit('changeUsername', localStorage.getItem('username'));
      commit('changeEmail', localStorage.getItem('email'));
      commit('changeUid', localStorage.getItem('username'));
      commit('setLoginStatus', localStorage.getItem('isLoggedIn'));
      commit('changeFarmName', localStorage.getItem('farmName'));
      commit('changeFarmUrl', localStorage.getItem('host'));
    },
  },
};
