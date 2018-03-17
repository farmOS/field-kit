export default {
  state: {
    isLoggedIn: false,
    name: null,
    //statusText is for testing purposes only
    statusText: 'AWAITING RESPONSE'
  },
  mutations: {
    login(state, creds) {
      state.isLoggedIn = true;
      state.name = creds.username;
    },
//the setStatusText mutation is for testing purposes only
    setStatusText(state, text) {
      state.statusText = text;
      console.log('STATUS TEXT:');
      console.log(state.statusText);
    }
<<<<<<< HEAD
  },
  actions: {
/*
TODO
- Ensure that basic page request works in native app
- Enable login request following steps devised in iOS project
- Enable permanent settings store for username, cookie, token
*/

    didSubmitCredentials ({commit}, payload) {

    console.log('RUNNING didSubmitCredentials')
    var username = payload.user;
    var password = payload.pass;

    const url = 'http://www.beetclock.com/farmOS/'

    //Trying CORS request
    var xhr = createCORSRequest('GET', url);
    if (!xhr) {
      throw new Error('CORS not supported');
    }

    xhr.onload = function() {
 var responseText = xhr.responseText;
 console.log(responseText);
 commit('setStatusText', responseText);
};

xhr.onerror = function() {
  console.log('There was an error!');
  commit('setStatusText', 'There was an error!');
};

xhr.send();


    //submitCredentials(username, password)
     //the 'then' callback method is not yet working
     /*
    .then( function (result){
      if (result === 'success') {
        commit('login', {username:username});
        console.log('RETURNED SUCCESS RESULT TO ACTION');
      } else {

      }
    })//then after commit
    */


        //Log in without checking credentials
        //commit('login', {username:username});

  } //end didSubmitCreds
  } //end actions
} // end export


// Function by Nicholas Zakas, from https://www.html5rocks.com/en/tutorials/cors/
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}

function submitCredentials(username, password) {

  $.ajax({
      url: 'http://www.farmos.org',
      success: function(data) {
          console.log('REQUEST SUCCESS!!');
          console.log(data);
      },
      error: function(data) {
          console.log('REQUEST FAILURE...');
          console.log(data);
      },
      dataType:'json'
  });

/*
  // jqxhr implements promise logic for ajax requests
  //Unsure if I need this
  var jqxhr = $.ajax(
   )
    .done(function() {
      alert( "success" );
    })
    .fail(function() {
      alert( "error" );
    })
    .always(function() {
      alert( "complete" );
    });
   */
=======
  }
>>>>>>> origin/jamie
}
