<template>
  <div>
    <div class="input-group">
      <input
        v-model="farmosUrl"
        placeholder="Enter your farmOS URL"
        type="text"
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
        class="form-control"
        v-on:input="checkValues"
      >
      <!-- <input
        v-model="password"
        placeholder="Enter your password"
        type="text"
        class="form-control"
        v-on:input="checkValues"
      > -->
    </div>
    <br>
    <div class="input-group">
      <button
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
    <div class="well">
      <!-- <p>{{statusText}}</p> -->
      <!-- Spinner removed due to compilation errors; need replacement -->
      <!-- <spinner :size="30" v-if="isWorking"></spinner> -->
      <br>
      <!-- <p v-if="isWorking">SPINNER SPIN!</p> -->
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
// spinner removed due to compilation errors; need replacement
// import Spinner from 'vue-spinner-component/src/Spinner.vue';

export default {
  components: {
    // Spinner
  },
  name: 'Login',
  data() {
    return {
      valuesEntered: false,
      username: '',
      password: '',
      farmosUrl: '',
      savedName: 'No name saved',
    };
  },
  computed: mapState({
    statusText: state => state.user.statusText,
    isLoggedIn: state => state.user.isLoggedIn,
    responseReceived: state => state.user.responseReceived,
    isWorking: state => state.user.isWorking,
    isOnline: state => state.user.isOnline,
  }),

  methods: {
    // We have the template calling addItem, so we need an addItem method within the component
    checkValues() {
      const urlIsValid = process.env.NODE_ENV === 'development' || this.username !== '';
      const usernameIsValid = this.username !== '';
      const passwordIsValid = this.password !== '';
      if (urlIsValid && usernameIsValid && passwordIsValid) {
        this.valuesEntered = true;
      }
    },
    submitCredentials() {
      // this.$emit('didSubmitCredentials', [this.username, this.password]);
      const creds = {
        farmosUrl: this.farmosUrl,
        username: this.username,
        password: this.password,
      };

      // Call didSubmitCredentials action, which will initiate the login process
      this.$store.dispatch('didSubmitCredentials', creds);
    },
    onDeviceReady() {
      console.log('RECEIVED DEVICEREADY');
      const storage = window.localStorage;
      const savedUrl = storage.getItem('url');
      this.$store.dispatch('checkLoginStatus', savedUrl);
    },
    // These network event handlers don't trigger on load, contrary to what I've read
    // onOnline() {
    //   this.$store.commit('setIsOnline', true);
    // },
    // onOffline() {
    //   this.$store.commit('setIsOnline', false);
    // },

  },
  created() {
    console.log('VUE IS READY');
    /*
    These listeners for Cordova network information events could be useful,
    but they don't trigger on load
    */
    // document.addEventListener("offline", this.onOnline(), false);
    // document.addEventListener("online", this.onOffline(), false);

    // Listens for deviceReady event emitted by Cordova
    document.addEventListener('deviceready', this.onDeviceReady(), false);
    // document.addEventListener("deviceready", this.onDeviceReady(), false);
    /*
    BYPASS LOGIN FOR TESTING
    const userLogin = { user: 'testerUser' };
    this.$store.commit('login', userLogin);
    */
  },
  watch: {
    /**
    TODO: It might be best to do this check at a higher level. It's possible
    this is causing issue #18: https://github.com/farmOS/farmOS-native/issues/18
    **/
    isLoggedIn() {
      console.log('isLoggedIn HAS CHANGED!!!');
      this.$router.push({ path: '/observations' });
    },
  },
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
