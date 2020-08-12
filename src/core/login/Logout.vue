<template lang="html">
  <div class="container-fluid">

    <div id="first-row" class="row">
      <div class="col">
        <div class="card text-primary border-primary mb-3">
          <div class="card-body">
            <h4 class="card-title">{{ $t('WARNING!')}}</h4>
            <p class="card-text">
              {{ $t('Logging out will permanently delete all logs stored on this device.')}}
              {{ $t('You will not be able to recover logs which have not been synced with')}}
              {{ $t('your farmOS server. Go back to sync any unsaved logs, or proceed to')}}
              {{ $t('logout and clear all data from this device.')}}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="row justify-content-sm-center">
      <div id="go-back" class="col col-sm-auto">
        <button
          @click="goBack"
          class="btn btn-lg btn-success"
          type="button"
          name="button">
          {{ $t('Go Back')}}
        </button>
      </div>
      <div class="col col-sm-auto">
        <button
          @click="logout"
          class="btn btn-lg btn-primary"
          type="button"
          name="button">
          {{ $t('Logout')}}
        </button>
      </div>
    </div>
    <div class="row justify-content-center" style="margin-top: 6rem">
      <p>
        Need to login again? <a href="/login">Login here</a>
      </p>
    </div>


  </div>
</template>

<script>
export default {
  name: 'Logout',
  methods: {
    goBack() {
      this.$router.back();
    },
    logout() {
      // Call logout function from farmos.js
      this.$store.dispatch('logout');

      // Remove logs, assets, areas, user info & site info from store & local persistance
      this.$store.commit('deleteAllLogs');
      this.$store.dispatch('deleteAllCachedLogs');
      this.$store.commit('deleteAllAssets');
      this.$store.dispatch('deleteAllCachedAssets');
      this.$store.commit('deleteAllAreas');
      this.$store.dispatch('deleteAllCachedAreas');
      this.$store.commit('deleteAllUnits');
      this.$store.dispatch('deleteAllCachedUnits');
      this.$store.commit('deleteAllCategories');
      this.$store.dispatch('deleteAllCachedCategories');
      this.$store.dispatch('deleteCachedUserAndSiteInfo');

      // Set login status to false and return to login screen
      this.$store.commit('setLoginStatus', false);
      this.$router.push({ path: '/login' });
    },
  },
};
</script>

<style lang="css" scoped>
  #first-row {
    margin-top: 6rem;
  }

  #go-back {
    text-align: right;
  }

  a {
    color: inherit;
    text-decoration: underline;
  }
</style>
