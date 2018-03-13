export default {
  state: {
    isLoggedIn: false,
    name: null,
  },
  mutations: {
    login(state, creds) {
      state.isLoggedIn = true;
      state.name = creds.username;
    }
  },
  actions: {
    didSubmitCredentials ({commit}, payload) {
    var username = payload.user;
    var password = payload.pass;

    //Log in without checking credentials
    commit('login', {username:username});
    
    //submitCredentials(username, password)
    /* the 'then' callback method is not yet working
    .then( function (result){
      if (result === 'success') {
        commit('login', {username:username});
        console.log('RETURNED SUCCESS RESULT TO ACTION');
      } else {

      }
    })//then after commit
    */
  } //end didSubmitCreds
  } //end actions
} // end export

function submitCredentials(username, password) {

  $.ajax({
      url: 'http://www.beetclock.com',
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
}
