<template>

  <div>
    <div class="input-group">
      <input v-model="farmosUrl" placeholder="Enter your farmOS URL" type="text" class="form-control" v-on:input="checkValues">
    </div>
    <br>
    <div class="input-group">
      <input v-model="username" placeholder="Enter your username" type="text" class="form-control" v-on:input="checkValues">
    </div>
    <br>
    <div class="input-group">
      <input v-model="password" placeholder="Enter your password" type="password" class="form-control" v-on:input="checkValues">
      <!--<input v-model="password" placeholder="Enter your password" type="text" class="form-control" v-on:input="checkValues">-->
    </div>
    <br>
    <div class="input-group">
      <button :disabled="!this.valuesEntered" title="Submit credentials" @click="submitCredentials" class="btn btn-default" type="button" >Submit credentials</button>
    </div>
    <br>

    <div class="well">
      <p>{{statusText}}</p>
      <!-- <spinner :size="30" v-if="isWorking"></spinner> -->
      <!--
      <br>
      <p v-if="isWorking">SPINNER SPIN!</p>
    -->
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
//adding spinner plugin
// import Spinner from 'vue-spinner-component/src/Spinner.vue';

export default {
  components: {
    // Spinner
  },
  name: 'Login',
  data () {
    return {
      valuesEntered: false,
      username: '',
      password: '',
      farmosUrl: '',
      savedName: 'No name saved'
    }
  },
  computed: mapState({
        statusText: state => state.user.statusText,
        isLoggedIn: state => state.user.isLoggedIn,
        responseReceived: state => state.user.responseReceived,
        isWorking: state=> state.user.isWorking,
        isOnline: state=> state.user.isOnline,
      }),

  methods: {
    //We have the template calling addItem, so we need an addItem method within the component
    checkValues () {
      if (this.username !== '' && this.password !== '' && this.farmosUrl !== '') {
        this.valuesEntered = true;
      }
    },
    submitCredentials () {
      // this.$emit('didSubmitCredentials', [this.username, this.password]);
      const creds = {
        farmosUrl: this.farmosUrl,
        username: this.username,
        password: this.password
      }

      //Call didSubmitCredentials action, which will initiate the login process
      this.$store.dispatch('didSubmitCredentials', creds)
    },

    onDeviceReady () {

      console.log('RECEIVED DEVICEREADY')

      var storage = window.localStorage;
      var savedUrl = storage.getItem('url');
      this.$store.dispatch('checkLoginStatus', savedUrl)

    },
    // These network event handlers don't trigger on load, contrary to what I've read
/*
    onOnline() {
      this.$store.commit('setIsOnline', true)
    },
    onOffline() {
      this.$store.commit('setIsOnline', false)
    },
*/

  }, //methods
  created: function() {
    console.log('VUE IS READY')
    /*
    These listeners for Cordova network information events could be useful,
    but they don't trigger on load
    */
    //document.addEventListener("offline", this.onOnline(), false);
    //document.addEventListener("online", this.onOffline(), false);

    //Listens for deviceReady event emitted by Cordova
    document.addEventListener("deviceready", this.onDeviceReady(), false);
    //document.addEventListener("deviceready", this.onDeviceReady(), false);
/*
BYPASS LOGIN FOR TESTING
//******
const userLogin = {user: 'testerUser'}
this.$store.commit('login', userLogin);
*/

  }, //created

  watch: {
    isLoggedIn: function () {
      console.log('isLoggedIn HAS CHANGED!!!')
      this.$router.push({path: '/new-observation'})
   }
  }
} // end export
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
