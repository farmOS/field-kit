<template lang="html">
  <div>
    <div v-if='showEditObs'>
      <EditObservation/>
    </div>
    <div v-if='showAllObs'>
      <AllObservations/>
    </div>
  </div>
</template>

<script>
import AllObservations from './AllObservations';
import EditObservation from './EditObservation';

export default {
  data() {
    return {
      // path: this.$router.currentRoute.path,
      path: '',
    };
  },
  computed: {
    /*
      FIXME: This and the lifecycle hooks below are a pretty sloppy implementation
      but manages to split the difference until we dcide we definitely want
      independent routes for the EditObservation and All Observation components,
      or the should not have routes at all and purely exist as child components.
    */
    showEditObs: {
      get() {
        return (this.path === '/edit-observation' || this.path === '/observations');
      },
      set(newPath) {
        return (newPath === '/edit-observation' || newPath === '/observations');
      },
    },
    showAllObs: {
      get() {
        return (this.path === '/all-observations' || this.path === '/observations');
      },
      set(newPath) {
        return (newPath === '/all-observations' || newPath === '/observations');
      },
    },
  },
  components: {
    AllObservations,
    EditObservation,
  },
  created() {
    this.$store.commit('clearLogs');
    this.$store.dispatch('loadCachedLogs', 'farm_observation');

    this.path = this.$router.currentRoute.path;
    this.showEditObs = (this.path === '/edit-observation' || this.path === '/observations');
    this.showAllObs = (this.path === '/all-observation' || this.path === '/observations');
  },
  beforeRouteUpdate(to) {
    this.path = to.path;
    this.showEditObs = (to.path === '/edit-observation' || to.path === '/observations');
    this.showAllObs = (to.path === '/all-observations' || to.path === '/observations');
  },
};
</script>

<style lang="css">
</style>
