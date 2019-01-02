import farmSync from '../data/farmSync';

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
            storage.setItem('url', url);
            storage.setItem('user', username);
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
                storage.setItem('url', noSslUrl);
                storage.setItem('user', username);
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
  },
};
