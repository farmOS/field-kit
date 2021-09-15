<template>
  <farm-main :paddingTop="['xl', 'xxl']" :paddingX="['m', 'xl', 'xxl']">
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text">https://</span>
      </div>
      <input
        v-model="host"
        :placeholder="$t('Enter your farmOS URL')"
        autofocus
        type="url"
        autocomplete="url"
        class="form-control"
        v-on:input="checkValues"
      >
    </div>
    <br>
    <div class="input-group">
      <input
        v-model="username"
        :placeholder="$t('Enter your username')"
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
        :placeholder="$t('Enter your password')"
        type="password"
        autocomplete="current-password"
        class="form-control"
        v-on:input="checkValues"
      >
    </div>
    <br>
    <div class="input-group login-submit">
      <button
        v-if="!authPending && !updatesPending"
        :disabled="!this.valuesEntered"
        title="Submit credentials"
        @click="submitCredentials"
        class="btn btn-success btn-navbar"
        type="button"
      >
        {{ $t('Submit credentials')}}
      </button>
    </div>
    <br>
    <div class="status-text">
      <farm-text v-if="!authPending && !updatesPending">
        {{ $t('Need a server? Check out')}}
        <a href="https://farmos.org/hosting/">{{ $t('hosting options')}}</a>.
      </farm-text>
      <icon-spinner v-if="authPending || updatesPending"/>
      <farm-text v-if="authPending">Authorizing...</farm-text>
      <farm-text v-if="updatesPending">Authorization successful!</farm-text>
      <farm-text v-if="updatesPending">Updating farm and user configuration...</farm-text>
    </div>
  </farm-main>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';

export default {
  name: 'Login',
  data() {
    return {
      valuesEntered: false,
      authPending: false,
      updatesPending: false,
      username: '',
      password: '',
      host: '',
    };
  },

  methods: {
    ...mapMutations(['alert']),
    ...mapActions([
      'updateProfile',
      'updateConfigDocs',
      'updateFieldModules',
      'purgeEntities',
    ]),
    checkValues() {
      const urlIsValid = process.env.NODE_ENV === 'development' || this.username !== '';
      const usernameIsValid = this.username !== '';
      const passwordIsValid = this.password !== '';
      if (urlIsValid && usernameIsValid && passwordIsValid) {
        this.valuesEntered = true;
      }
    },
    submitCredentials() {
      this.authPending = true;
      const payload = {
        host: this.host,
        username: this.username,
        password: this.password,
      };
      this.$store.dispatch('authorize', payload)
        .then(() => {
          this.updatesPending = true;
          this.authPending = false;
          return this.updateProfile()
            .then(this.updateConfigDocs)
            .then(this.updateFieldModules)
            .then(this.purgeEntities)
            .then(() => {
              this.updatesPending = false;
              this.$router.push('/home');
            });
        })
        .catch((e) => {
          this.authPending = false;
          this.updatesPending = false;
          this.alert(e);
        });
    },
  },
  created() {
    this.host = localStorage.getItem('host')?.replace(/(^\w+:|^)\/\//, '') || '';
  },
};

</script>

<style scoped>

 .login-submit {
   justify-content: center;
 }
 .status-text {
   text-align: center;
 }

</style>
