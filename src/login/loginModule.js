export default {
  state: {
    isLoggedIn: false,
    name: null,
    //statusText is for testing purposes only
    statusText: 'Waiting for credentials',
    //responseReceived is for testing purposes only
    responseReceived: null,
  },
  mutations: {
    login(state, creds) {
      state.isLoggedIn = true;
      state.name = creds.username;
      console.log('LOGGED IN AS: '+creds.username)
    },
//the setStatusText mutation is for testing purposes only
    setStatusText(state, text) {
      state.statusText = text;
      console.log('STATUS TEXT:');
      console.log(state.statusText);
    },
//likewise, responseWasReceived is for testing purposes only
    responseWasReceived(state, response) {
      state.responseReceived = response;
    }

  },
  actions: {

/*
TODO
- Enable persistant settings store for url, username, token
- On load, check whether the device is online.  If not, proceed directly to main view
- If online, check if the app is already authenticated on the server.
If not, present login.  If so, get username, token from settings
*/

    didSubmitCredentials ({commit}, payload) {

    console.log('RUNNING didSubmitCredentials')
    var url = payload.farmosUrl;
    var username = payload.username;
    var password = payload.password;

    commit('setStatusText', 'Credentials submitted; waiting for response from server');

        submitCredentials(url, username, password)
        .then( function (response){

          commit('responseWasReceived', 'ok');
          commit('setStatusText', 'Server response: '+JSON.stringify(response));
          //commit('login', {username:username});
        },
        function (error){

          commit('responseWasReceived', 'error');
          commit('setStatusText', 'Server response: '+JSON.stringify(error));
        }
      ); //end promise then

  }, //end didSubmitCreds

  checkLoginStatus ({commit}, url) {
    console.log('RUNNING checkLoginStatus URL: '+url)
    commit('setStatusText', 'Get user submitted; waiting for response');

    checkUser(url)
    .then( function (response){
      commit('setStatusText', 'Get user response: '+JSON.stringify(response));
      //commit('login', {username:username});
    },
    function (error){
      commit('setStatusText', 'Get user error: '+JSON.stringify(error));
    }
    )//end then
  }//end checkLoginStatus

  } //end actions
} // end export

function checkUser(url) {
  var submissionPromise = new Promise (function (resolve, reject) {
console.log('CHECKING WHETHER USER IS LOGGED IN')

var userUrl = url+'/?q=user'
console.log('REQUEST URL: '+userUrl)
var requestHeaders = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"};

  $.ajax({
      type: 'GET',
      url: userUrl,
      headers: requestHeaders,
      success: function(response) {
          console.log('USER REQUEST SUCCESS!!');
          console.log('STATUS: '+response.status);
          console.log('STATUS TEXT: '+response.statusText);
          //commit('setStatusText', response);
          resolve(response);
      },
      error: function(error) {
          console.log('USER REQUEST ERROR...');
          console.log('USER RESPONSE: '+ JSON.stringify(error));
          //commit('setStatusText', response);
          reject(error);
      },
  }); //end ajax

}); // end promise
return submissionPromise;
} //end checkUser

function submitCredentials(url, username, password) {
  var submissionPromise = new Promise (function (resolve, reject) {
console.log('SIGNING IN WITH USERNAME: '+username+'; password: '+password)
//Set login parameters that will be attached as the data payload of the ajax request

var loginUrl = url+'/?q=user/login'

var requestData = {'form_id': 'user_login', 'name': username, 'pass': password};
//Following header guidance from https://www.quora.com/How-do-I-send-custom-headers-using-jquery-Ajax-and-consume-the-same-header-in-WCF-using-C
//var requestHeaders = {'Content-Type':'application/json'}
var requestHeaders = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"};

  $.ajax({
      type: 'POST',
      url: loginUrl,
      headers: requestHeaders,
      data: requestData,
      dataType:'json',
      success: function(response) {
          console.log('REQUEST SUCCESS!!');
          console.log('STATUS: '+response.status);
          console.log('STATUS TEXT: '+response.statusText);
          //commit('setStatusText', response);
          resolve(response);
      },
      error: function(error) {
          console.log('REQUEST FAILURE...');
          console.log('STATUS: '+error.status);
          console.log('STATUS TEXT: '+error.statusText);
          console.log('RESPONSE: '+ JSON.stringify(error));
          //commit('setStatusText', response);
          reject(error);
      },
  }); //end ajax

}); // end promise
return submissionPromise;
} //end submitCredentials
