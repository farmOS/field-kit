import jQuery from './jquery'; // eslint-disable-line no-unused-vars

export default {
  actions: {

    didSubmitCredentials(context, payload) {
      console.log('RUNNING didSubmitCredentials');
      const url = (process.env.NODE_ENV === 'development')
        ? ''
        : `http://${payload.farmosUrl}`;
      const { username, password, router } = payload;

      // Return a promise so the component knows when the action completes.
      return new Promise((resolve) => {
        // TODO: break out helper functions into separate module
        submitCredentials(url, username, password) // eslint-disable-line no-use-before-define
          .then(() => {
            // Save our username and password to the persistant store
            const storage = window.localStorage;
            storage.setItem('url', url);
            storage.setItem('user', username);
            storage.setItem('password', password);
            // Then request a token from the server
            // TODO: break out helper functions into separate module
            requestToken(url) // eslint-disable-line no-use-before-define
              .then((tokenResponse) => {
              // Store token as setting
                storage.setItem('token', tokenResponse);
                // Go back 1 page, or reroute to home page
                if (window.history.length > 1) {
                  window.history.back();
                  resolve();
                  return;
                }
                router.push('/');
                resolve();
              });
          }).catch((error) => {
            console.log(`Server response: ${JSON.stringify(error)}`);
            resolve();
          });
      });
    },

  },
};

// TODO: break out helper functions into separate module
function submitCredentials(url, username, password) {
  const submissionPromise = new Promise((resolve, reject) => {
    console.log(`SIGNING IN WITH USERNAME: ${username}; password: ${password}`);

    // Set login parameters that will be attached as the data payload of the ajax request
    const loginUrl = `${url}/user/login`;
    console.log(`LOGIN REQUEST URL ${loginUrl}`);
    const requestData = {
      form_id: 'user_login',
      name: username,
      pass: password,
    };
    // Following header guidance from https://www.quora.com/How-do-I-send-custom-headers-using-jquery-Ajax-and-consume-the-same-header-in-WCF-using-C
    const requestHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'json',
    };

    /*
      TODO: This is the last $.ajax() call left to be replaced by fetch().
      For details, see: https://github.com/farmOS/farmOS-native/issues/55.
    */
    // fetch(loginUrl, {
    //   method: 'POST',
    //   headers: requestHeaders,
    //   credentials: 'include',
    //   body: new URLSearchParams(requestData),
    // }).then((response) => {
    //   console.log('fetch response: ', response);
    //   if (!response.ok) {
    //     throw response;
    //   }
    //   return response.json();
    // }).then((response) => {
    //   console.log('REQUEST SUCCESS!!');
    //   console.log(`STATUS: ${response.status}`);
    //   console.log(`STATUS TEXT: ${response.statusText}`);
    //   resolve(response);
    // }).catch((error) => {
    //   console.log('REQUEST FAILURE...');
    //   console.log(`STATUS: ${error.status}`);
    //   console.log(`STATUS TEXT: ${error.statusText}`);
    //   console.log(`RESPONSE: ${JSON.stringify(error)}`);
    //   reject(error);
    // });

    $.ajax({ // eslint-disable-line no-undef
      type: 'POST',
      url: loginUrl,
      headers: requestHeaders,
      data: requestData,
      success: (response) => {
        console.log('REQUEST SUCCESS!!');
        console.log(`STATUS: ${response.status}`);
        console.log(`STATUS TEXT: ${response.statusText}`);
        resolve(response);
      },
      error: (error) => {
        console.log('REQUEST FAILURE...');
        console.log(`STATUS: ${error.status}`);
        console.log(`STATUS TEXT: ${error.statusText}`);
        console.log(`RESPONSE: ${JSON.stringify(error)}`);
        reject(error);
      },
    });
  });
  return submissionPromise;
}

// TODO: break out helper functions into separate module
function requestToken(url) {
  const submissionPromise = new Promise((resolve, reject) => {
    const tokenUrl = `${url}/restws/session/token`;
    console.log(`TOKEN REQUEST URL: ${tokenUrl}`);
    // Following header guidance from https://www.quora.com/How-do-I-send-custom-headers-using-jquery-Ajax-and-consume-the-same-header-in-WCF-using-C
    const requestHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'json',
    };

    fetch(tokenUrl, {
      method: 'GET',
      headers: requestHeaders,
      credentials: 'include',
    }).then((response) => {
      console.log('fetch response: ', response);
      if (!response.ok) {
        throw response;
      }
      return response.text();
    }).then((response) => {
      console.log(`TOKEN OBTAINED: ${response}`);
      // const storage = window.localStorage;
      resolve(response);
    }).catch((error) => {
      console.log('TOKEN ERROR: NO TOKEN OBTAINED');
      console.log(`RESPONSE: ${JSON.stringify(error)}`);
      reject(error);
    });
  });
  return submissionPromise;
}
