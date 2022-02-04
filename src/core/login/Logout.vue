<template>
  <farm-main :paddingTop="['xl', 'xxl']" :paddingX="['l', 'xxl']">

    <farm-stack space="l">
      <farm-card backgroundColor="red">
        <h3 class="card-title">{{ $t('WARNING!')}}</h3>
        <p class="card-text">
          {{ $t('Logging out will permanently delete all logs stored on this device.')}}
          {{ $t('You will not be able to recover logs which have not been synced with')}}
          {{ $t('your farmOS server. Go back to sync any unsaved logs, or proceed to')}}
          {{ $t('logout and clear all data from this device.')}}
        </p>
      </farm-card>
      <farm-inline justifyContent="center" space="m">
        <button
          @click="goBack"
          class="btn btn-lg btn-success"
          type="button"
          name="button">
          {{ $t('Go Back')}}
        </button>
        <button
          @click="logout"
          class="btn btn-lg btn-primary"
          type="button"
          name="button">
          {{ $t('Logout')}}
        </button>
      </farm-inline>
      <p style="text-align: center">
        Need to login again? <router-link to="/login">Login here</router-link>
      </p>
    </farm-stack>

  </farm-main>
</template>

<script>
import { deleteDatabase } from '../idb';
import databases from '../idb/databases';

const idbNames = Object.values(databases).map(d => d.name);

export default {
  name: 'LogoutScreen',
  methods: {
    goBack() {
      this.$router.back();
    },
    logout() {
      // Clear localStorage and delete all IndexedDB databases.
      window.localStorage.clear();
      Promise.all(idbNames.map(deleteDatabase)).then(() => {
        // Once everything in persistent storage is blown away, load the login
        // screen via the Location API, instead of Vue Router, so the app is
        // forced to restart as a clean install, thereby clearing the store.
        window.location.assign('/login');
      });
    },
  },
};
</script>

<style lang="css" scoped>
  a {
    color: inherit;
    text-decoration: underline;
  }
</style>
