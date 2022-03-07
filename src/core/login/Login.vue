<template>
  <farm-main :paddingTop="['xl', 'xxl']" :paddingX="['m', 'xl', 'xxl']">
    <app-bar-options :title="$t('Login')"/>
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text">https://</span>
      </div>
      <input
        v-model="url"
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
import { refreshCache } from '../idb/cache';
import { getHost } from '../remote';
import { updateFieldModules } from '../field-modules';
import { updateConfigDocs } from '../store/configDocuments';
import { updateProfile } from '../store/profile';

export default {
  name: 'LoginScreen',
  data() {
    return {
      valuesEntered: false,
      authPending: false,
      updatesPending: false,
      username: '',
      password: '',
      url: '',
    };
  },
  inject: ['alert'],
  methods: {
    checkValues() {
      const urlIsValid = process.env.NODE_ENV === 'development' || this.url !== '';
      const usernameIsValid = this.username !== '';
      const passwordIsValid = this.password !== '';
      if (urlIsValid && usernameIsValid && passwordIsValid) {
        this.valuesEntered = true;
      }
    },
    submitCredentials() {
      this.authPending = true;
      const host = process.env.NODE_ENV === 'development'
        ? '' : `https://${this.url.replace(/(^\w+:|^)\/\//, '')}`;
      const payload = {
        host,
        username: this.username,
        password: this.password,
      };
      this.$store.dispatch('authorize', payload)
        .then(() => {
          this.updatesPending = true;
          this.authPending = false;
          return updateConfigDocs()
            .then(updateProfile)
            .then(updateFieldModules)
            .then(refreshCache)
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
    this.url = getHost()?.replace(/(^\w+:|^)\/\//, '') || '';
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
