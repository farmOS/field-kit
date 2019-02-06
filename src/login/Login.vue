<template>
  <div id="login">
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text">https://</span>
      </div>
      <input
        v-model="farmosUrl"
        placeholder="Enter your farmOS URL"
        autofocus
        type="text"
        autocomplete="url"
        class="form-control"
        v-on:input="checkValues"
      >
    </div>
    <br>
    <div class="input-group">
      <input
        v-model="username"
        placeholder="Enter your username"
        type="text"
        autocomplete="username"
        class="form-control"
        v-on:input="checkValues"
      >
    </div>
    <br>
    <div class="input-group">
      <input
        v-model="password"
        placeholder="Enter your password"
        type="password"
        autocomplete="current-password"
        class="form-control"
        v-on:input="checkValues"
      >
    </div>
    <br>
    <div class="input-group login-submit">
      <div v-if="authPending">
        <icon-spinner/>
      </div>
      <button
        v-else
        :disabled="!this.valuesEntered"
        title="Submit credentials"
        @click="submitCredentials"
        class="btn btn-success btn-navbar"
        type="button"
      >
        Submit credentials
      </button>
    </div>
    <br>
    <p>Need a server? Check out <a href="https://farmos.org/hosting/">hosting options</a>.</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import iconSpinner from '../icons/icon-spinner.vue';

export default {
  components: {
    iconSpinner,
  },
  name: 'Login',
  data() {
    return {
      valuesEntered: false,
      authPending: false,
      username: '',
      password: '',
      farmosUrl: '',
    };
  },

  methods: {
    checkValues() {
      const urlIsValid = process.env.NODE_ENV === 'development' || this.username !== '';
      const usernameIsValid = this.username !== '';
      const passwordIsValid = this.password !== '';
      if (urlIsValid && usernameIsValid && passwordIsValid) {
        this.valuesEntered = true;
      }
    },
    submitCredentials() {
      const payload = {
        farmosUrl: this.farmosUrl,
        username: this.username,
        password: this.password,
        router: this.$router,
      };

      this.authPending = true;

      // Call didSubmitCredentials action, which will initiate the login process
      // and return a promise; when it resolves, reset authPending.
      this.$store.dispatch('didSubmitCredentials', payload)
        .then(() => {
          this.authPending = false;
          this.$store.commit('setLoginStatus', true);
          this.$store.dispatch('updateUserInfo');
          this.$store.dispatch('updateSiteInfo');
        });
    },
    onDeviceReady() {
      console.log('RECEIVED DEVICEREADY');
      this.loadUserInfo();
    },

    // This will autofill the form with the url and username; the regext strips the protocol.
    loadUserInfo() {
      this.farmosUrl = window.localStorage.getItem('host').replace(/(^\w+:|^)\/\//, '');
      this.username = window.localStorage.getItem('username');
      this.password = window.localStorage.getItem('password');
      this.checkValues();
    }

  },
  created() {
    console.log('VUE IS READY');

    // Listens for deviceReady event emitted by Cordova
    document.addEventListener('deviceready', this.onDeviceReady(), false);
    this.loadUserInfo();
  },
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  #login:first-child {
    margin-top: 9rem;
  }

 .login-submit {
   justify-content: center;
 }

</style>
