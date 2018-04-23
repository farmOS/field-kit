export default {
  state: {
    isLoggedIn: false,
    name: null,
    //statusText is for testing purposes only
    statusText: 'Waiting for credentials',
    //responseReceived is for testing purposes only
    responseReceived: null,
    isWorking: false,
    isOnline: false,
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
      console.log('STATUS TEXT: '+state.statusText);
    },
//likewise, responseWasReceived is for testing purposes only
    responseWasReceived(state, response) {
      state.responseReceived = response;
    },
    setIsWorking(state, booleanValue) {
      state.isWorking = booleanValue;
    },
    setIsOnline(state, booleanValue){
      state.isOnline = booleanValue;
      console.log('SET IS ONLINE: '+state.isOnline);
    }

  },
  actions: {

    didSubmitCredentials ({commit}, payload) {

    console.log('RUNNING didSubmitCredentials')
    var url = payload.farmosUrl;
    var username = payload.username;
    var password = payload.password;

    commit('setStatusText', 'Credentials submitted; waiting for response from server');
    commit('setIsWorking', true)
        submitCredentials(url, username, password)
        .then( function (response){
          commit('responseWasReceived', 'ok');
          commit('setStatusText', 'Server response: '+JSON.stringify(response));

          //If we receive an affirmative login response, we will save our username and password to the persistant store
          var storage = window.localStorage;
          storage.setItem('url', url);
          storage.setItem('user', username);
          //Then request a token from the server
          requestToken(url)
          .then( function (tokenResponse){
            //Store token as setting
            storage.setItem('token', tokenResponse);
            //commit('setStatusText', 'Token received: '+tokenResponse);
            commit('setStatusText', 'Login complete!');
            //set isOnline to true, in case user went online after loading the app
            commit('setIsOnline', true)
            //Go ahead and log in
            const userLogin = {username: username};
            commit('setIsWorking', false)
            commit('login', userLogin);

          },
          function (tokenError){
            commit('setStatusText', 'Token error: '+JSON.stringify(tokenError));
            commit('setIsWorking', false)
          }); // end promise token

          //commit('login', {username:username});
        },
        function (error){
          commit('responseWasReceived', 'error');
          commit('setStatusText', 'Server response: '+JSON.stringify(error));
          commit('setIsWorking', false)
        }
      ); //end promise submitted

  }, //end didSubmitCreds


/*
checkLoginStatus is a bit misnamed, becuase it actually checks both network status
AND login status.  First calls networkInfo to get network status from the cordova
network information plugin.  If online, it calls the checkUser function to see if the
stored username, cookie and token are valid
*/
  checkLoginStatus ({commit}, url) {
    console.log('RUNNING checkLoginStatus URL: '+url)

networkInfo()
.then(function(state) {
  var networkMessage = 'NETWORK STATE IS: '+state;
  console.log(networkMessage);
  commit('setStatusText', networkMessage);

  if (state !== Connection.NONE) {
    commit('setIsOnline', true)
    checkUser(url)
        .then( function (response){
          //commit('setStatusText', 'Get user response: '+JSON.stringify(response));
          var storage = window.localStorage;
          var storedName = storage.getItem('user');
          const userLogin = {username: storedName}
          commit('login', userLogin);
        },
        function (error){
          console.log('Get user error: '+JSON.stringify(error))
          //commit('setStatusText', 'Get user error: '+JSON.stringify(error));
        }
        )//end then
  } else {
    //If the user is not online but has logged in previously, skip login and go directly to newObservation
    var storage = window.localStorage;
    var storedName = storage.getItem('user');
    console.log('STORED USERNAME OFFLINE: '+storedName)
    if (storedName !== null) {
    const userLogin = {username: storedName}
    commit('login', userLogin);
    }
  } //end if else online


}) //end networkInfo Then

  },//end checkLoginStatus

  } //end actions
} //end export

function checkUser(url) {
  var submissionPromise = new Promise (function (resolve, reject) {
console.log('CHECKING WHETHER THE USER IS LOGGED IN')

var userUrl = url+'/user'
//var userUrl = url+'/?q=user'
console.log('USER REQUEST URL: '+userUrl)
//var requestHeaders = {"Content-Type":"application/json"};
//var requestHeaders = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"};
var requestHeaders = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "json"};
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

var loginUrl = url+'/user/login'
//var loginUrl = url+'/?q=user/login'
console.log('LOGIN REQUEST URL '+loginUrl);
var requestData = {'form_id': 'user_login', 'name': username, 'pass': password};
//Following header guidance from https://www.quora.com/How-do-I-send-custom-headers-using-jquery-Ajax-and-consume-the-same-header-in-WCF-using-C
//var requestHeaders = {"Content-Type":"application/json"};
//var requestHeaders = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"};
var requestHeaders = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "json"};
  $.ajax({
      type: 'POST',
      url: loginUrl,
      headers: requestHeaders,
      data: requestData,
      //dataType:'json',
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


function requestToken(url) {
  var submissionPromise = new Promise (function (resolve, reject) {

var tokenUrl = url+'/restws/session/token'
//var tokenUrl = url+'/?q=restws/session/token'
console.log('TOKEN REQUEST URL: '+tokenUrl)
//Following header guidance from https://www.quora.com/How-do-I-send-custom-headers-using-jquery-Ajax-and-consume-the-same-header-in-WCF-using-C
//var requestHeaders = {"Content-Type":"application/json"};
//var requestHeaders = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"};
var requestHeaders = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "json"};

  $.ajax({
      //type: 'GET',
      type: 'GET',
      url: tokenUrl,
      headers: requestHeaders,
      success: function(response) {
          console.log('TOKEN OBTAINED: '+response);
          var storage = window.localStorage;
          resolve(response);
      },
      error: function(error) {
          console.log('TOKEN ERROR: NO TOKEN OBTAINED');
          console.log('RESPONSE: '+ JSON.stringify(error));
          reject(error);
      },
  }); //end ajax
}); // end promise
return submissionPromise;
} //end requestToken

/*
Detects network status using the Cordova network info plugin
*/
function networkInfo(){
  var submissionPromise = new Promise (function (resolve, reject) {
    console.log('RUNNING networkInfo');
    /*
    I had a hell of a time figuring out how to make this work.
    Ultimately I had to delay the navigator call for 2 seconds
    If this call is made immediately onDeviceReady, it crashes the app...
    */
    setTimeout(function() {
      var networkState = navigator.connection.type;
      resolve(networkState);
    }, 2000);
    }); // end promise
    return submissionPromise;
} //end networkInfo
