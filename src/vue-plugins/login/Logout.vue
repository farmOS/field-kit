<template lang="html">
  <div class="container-fluid">

    <div id="first-row" class="row">
      <div class="col">
        <div class="card text-primary border-primary mb-3">
          <div class="card-body">
            <h4 class="card-title">WARNING!</h4>
            <p class="card-text">
              Logging out will permanently delete all logs stored on this device.
              You will not be able to recover logs which have not been synced with
              your farmOS server. Go back to sync any unsaved logs, or proceed to
              logout and clear all data from this device.
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
          Go Back
        </button>
      </div>
      <div class="col col-sm-auto">
        <button
          @click="logout"
          class="btn btn-lg btn-primary"
          type="button"
          name="button">
          Logout
        </button>
      </div>
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

        // Remove logs, assets, areas, user info & site info from store
        this.$store.commit('clearLogs');
        this.$store.commit('clearAssets');
        this.$store.commit('clearAreas');
        this.$store.commit('changeUsername', '');
        this.$store.commit('changeEmail', '');
        this.$store.commit('changeUid', '');
        this.$store.commit('changeFarmName', '');
        this.$store.commit('changeFarmUrl', '');

        // Remove logs, assets, areas, user info & site info from local persistance
        this.$store.dispatch('deleteAllCachedLogs');
        this.$store.dispatch('deleteAllCachedAssets');
        this.$store.dispatch('deleteAllCachedAreas');
        this.$store.dispatch('deleteAllCachedUnits');
        this.$store.dispatch('deleteAllCachedEquipment');
        this.$store.dispatch('deleteAllCachedCategories');
        this.$store.dispatch('deleteCachedUserAndSiteInfo');

        // Set login status to false and return to login screen
        this.$store.commit('setLoginStatus', false);
        this.$router.push({ path: '/login' });
      },
    },
  }
</script>

<style lang="css" scoped>
  #first-row {
    margin-top: 3rem;
  }

  #go-back {
    text-align: right;
  }
</style>
