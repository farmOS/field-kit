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
      <input v-model="password" placeholder="Enter your password" type="text" class="form-control" v-on:input="checkValues">
    </div>
    <br>
    <div class="input-group">
      <button :disabled="!this.valuesEntered" title="Submit credentials" @click="submitCredentials" class="btn btn-default" type="button" >Submit credentials</button>
    </div>
    <br>
    <div class="input-group">
      <button :disabled="this.responseReceived != 'ok' && this.responseReceived != 'error'" title="Proceed to new observation" @click="doLogin" class="btn btn-default" type="button" >Proceed to new observation</button>
    </div>
    <br>
    <div class="well">
    <p>{{statusText}}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'Login',
  data () {
    return {
      valuesEntered: false,
      username: '',
      password: '',
      farmosUrl: ''
    }
  },
  computed: mapState({
        statusText: state => state.user.statusText,
        isLoggedIn: state => state.user.isLoggedIn,
        responseReceived: state => state.user.responseReceived
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
    doLogin () {
      //doLogin and the associated button are for testing porposes only
      //eventually, we can call the commit from the didSubmitCredentials action
      const userLogin = {username: this.username}
      this.$store.commit('login', userLogin);
    }

  }, //methods
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
