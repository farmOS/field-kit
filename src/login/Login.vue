<template>
  <div>
    <div class="input-group">
      <input v-model="username" placeholder="Enter your username" type="text" class="form-control" v-on:input="checkValues">
    </div>
    <br>
    <div class="input-group">
      <input v-model="password" placeholder="Enter your password" type="text" class="form-control" v-on:input="checkValues">
    </div>
    <br>
    <div class="input-group">
      <button :disabled="!this.valuesEntered" title="login" @click="submitCredentials" class="btn btn-default" type="button" >Log in!</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      valuesEntered: false,
      username: '',
      password: ''
    }
  },
  methods: {
    //We have the template calling addItem, so we need an addItem method within the component
    checkValues () {
      if (this.username !== '' && this.password !== '') {
        this.valuesEntered = true;
      }
    },
    submitCredentials () {
      // this.$emit('didSubmitCredentials', [this.username, this.password]);
      const creds = {
        username: this.username,
        password: this.password
      }
      this.$store.commit('login', creds);
      this.$router.push({path: 'observations'})
    }

  }//methods
} // end export
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
