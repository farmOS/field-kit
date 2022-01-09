<template lang="html">
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
      <p style="textAlign: center">
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
  name: 'Logout',
  methods: {
    goBack() {
      this.$router.back();
    },
    logout() {
      // Clear all logs, assets and other entities from the Vuex store.
      this.$store.commit('clearAllEntities');
      // Clear the user profile, settings and other core config from the Vuex store.
      this.$store.commit('clearCoreState');
      // Clear localStorage and delete all IndexedDB databases.
      window.localStorage.clear();
      Promise.all(idbNames.map(deleteDatabase)).then(() => {
        // Once everything is blown away, force a hard load of the login screen,
        // without using Vue Router, so the app restarts as a clean install.
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
