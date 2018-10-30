export default {
  state: {
    isLoggedIn: false,
    name: null,
    // statusText is for testing purposes only
    statusText: 'Waiting for credentials',
    // responseReceived is for testing purposes only
    responseReceived: null,
    isWorking: false,
    isOnline: false,
  },
  mutations: {
    login(state, creds) {
      state.isLoggedIn = true;
      state.name = creds.username;
      console.log(`LOGGED IN AS: ${creds.username}`);
    },
    // the setStatusText mutation is for testing purposes only
    setStatusText(state, text) {
      state.statusText = text;
      console.log(`STATUS TEXT: ${state.statusText}`);
    },
    // likewise, responseWasReceived is for testing purposes only
    responseWasReceived(state, response) {
      state.responseReceived = response;
    },
    setIsWorking(state, booleanValue) {
      state.isWorking = booleanValue;
    },
    setIsOnline(state, booleanValue) {
      state.isOnline = booleanValue;
      console.log(`SET IS ONLINE: ${state.isOnline}`);
    },

  },
  actions: {

    didSubmitCredentials({ commit }, payload) {
      console.log('RUNNING didSubmitCredentials');
      const url = payload.farmosUrl;
      const { username, password } = payload;

      commit('setStatusText', 'Credentials submitted; waiting for response from server');
      commit('setIsWorking', true);
      // TODO: break out helper functions into separate module
      submitCredentials(url, username, password) // eslint-disable-line no-use-before-define
        .then((response) => {
          commit('responseWasReceived', 'ok');
          commit('setStatusText', `Server response: ${JSON.stringify(response)}`);

          // Save our username and password to the persistant store
          const storage = window.localStorage;
          storage.setItem('url', url);
          storage.setItem('user', username);
          // Then request a token from the server
          // TODO: break out helper functions into separate module
          requestToken(url) // eslint-disable-line no-use-before-define
            .then((tokenResponse) => {
            // Store token as setting
              storage.setItem('token', tokenResponse);
              // commit('setStatusText', 'Token received: '+tokenResponse);
              commit('setStatusText', 'Login complete!');
              // set isOnline to true, in case user went online after loading the app
              commit('setIsOnline', true);
              // Go ahead and log in
              const userLogin = { username };
              commit('setIsWorking', false);
              commit('login', userLogin);
            },
            (tokenError) => {
              commit('setStatusText', `Token error: ${JSON.stringify(tokenError)}`);
              commit('setIsWorking', false);
            });
        },
        (error) => {
          commit('responseWasReceived', 'error');
          commit('setStatusText', `Server response: ${JSON.stringify(error)}`);
          commit('setIsWorking', false);
        });
    },

    /*
    checkLoginStatus is a bit misnamed, becuase it actually checks both network status
    AND login status.  First calls networkInfo to get network status from the cordova
    network information plugin.  If online, it calls the checkUser function to see if the
    stored username, cookie and token are valid
    */
    checkLoginStatus({ commit }, url) {
      console.log(`RUNNING checkLoginStatus URL: ${url}`);

      // TODO: break out helper functions into separate module
      networkInfo() // eslint-disable-line no-use-before-define
        .then((state) => {
          const networkMessage = `NETWORK STATE IS: ${state}`;
          console.log(networkMessage);
          commit('setStatusText', networkMessage);

          if (state !== Connection.NONE) { // eslint-disable-line no-undef
            commit('setIsOnline', true);
            // TODO: break out helper functions into separate module
            checkUser(url) // eslint-disable-line no-use-before-define
              // FIXME: This then method does nothing with the response.
              .then(() => {
                const storage = window.localStorage;
                const storedName = storage.getItem('user');
                const userLogin = { username: storedName };
                commit('login', userLogin);
              },
              (error) => {
                console.log(`Get user error: ${JSON.stringify(error)}`);
              });
          } else {
            // If the user is not online but has logged in previously,
            // skip login and go directly to EditObservation
            const storage = window.localStorage;
            const storedName = storage.getItem('user');
            console.log(`STORED USERNAME OFFLINE: ${storedName}`);
            if (storedName !== null) {
              const userLogin = { username: storedName };
              commit('login', userLogin);
            }
          }
        });
    },
  },
};

// TODO: break out helper functions into separate module
function checkUser(url) {
  const submissionPromise = new Promise((resolve, reject) => {
    console.log('CHECKING WHETHER THE USER IS LOGGED IN');
    const userUrl = `${url} /user`;
    console.log(`USER REQUEST URL: ${userUrl}`);
    const requestHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };
    fetch(userUrl, {
      method: 'GET',
      headers: requestHeaders,
      credentials: 'include',
    }).then((response) => {
      console.log('fetch response: ', response);
      if (!response.ok) {
        throw response;
      }
      return response.json();
    }).then((response) => {
      console.log('USER REQUEST SUCCESS!!');
      console.log(`STATUS: ${response.status}`);
      console.log(`STATUS TEXT: ${response.statusText}`);
      resolve(response);
    }).catch((error) => {
      console.log('USER REQUEST ERROR...');
      console.log(`USER RESPONSE: ${JSON.stringify(error)}`);
      reject(error);
    });
  });
  return submissionPromise;
}

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
      Accept: 'application/json',
    };
    fetch(loginUrl, {
      method: 'POST',
      headers: requestHeaders,
      credentials: 'include',
      body: requestData,
    }).then((response) => {
      console.log('fetch response: ', response);
      if (!response.ok) {
        throw response;
      }
      return response.json();
    }).then((response) => {
      console.log('REQUEST SUCCESS!!');
      console.log(`STATUS: ${response.status}`);
      console.log(`STATUS TEXT: ${response.statusText}`);
      resolve(response);
    }).catch((error) => {
      console.log('REQUEST FAILURE...');
      console.log(`STATUS: ${error.status}`);
      console.log(`STATUS TEXT: ${error.statusText}`);
      console.log(`RESPONSE: ${JSON.stringify(error)}`);
      reject(error);
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
      Accept: 'application/json',
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

// TODO: break out helper functions into separate module
/*
Detects network status using the Cordova network info plugin
*/
function networkInfo() {
  // FIXME: Add `reject` callback
  const submissionPromise = new Promise((resolve) => {
    console.log('RUNNING networkInfo');
    /*
    I had a hell of a time figuring out how to make this work.
    Ultimately I had to delay the navigator call for 2 seconds
    If this call is made immediately onDeviceReady, it crashes the app...
    */
    setTimeout(() => {
      const networkState = navigator.connection.type || navigator.connection.effectiveType;
      resolve(networkState);
    }, 2000);
  }); // end promise
  return submissionPromise;
}
