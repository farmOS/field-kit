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
      showEditObs: true,
      showAllObs: true,
    }
  },
  components: {
    AllObservations,
    EditObservation,
  },
  created() {
    this.$store.commit('clearLogs');
    this.$store.dispatch('loadCachedLogs', 'farm_observation');
  },
};
</script>

<style lang="css">
</style>
