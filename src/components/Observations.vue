<template lang="html">
  <div>
    <div v-if='showEditObs'>
      <EditObservation
        v-on:view-all='toggleObs'
      />
    </div>
    <div v-if='showAllObs'>
      <AllObservations
        v-on:create-observation='toggleObs'
      />
    </div>
  </div>
</template>

<script>
import AllObservations from './AllObservations';
import EditObservation from './EditObservation';
import { mapState } from 'vuex';

export default {
  data() {
    return {
      showEditObs: false,
      showAllObs: true,
    };
  },
  components: {
    AllObservations,
    EditObservation,
  },
  methods: {
    toggleObs() {
      this.showEditObs = !this.showEditObs;
      this.showAllObs = !this.showAllObs;
    },
  },
  created() {
    this.$store.commit('clearLogs');
    this.$store.dispatch('loadCachedLogs', 'farm_observation');
  },
  beforeDestroy() {
    this.$store.commit('clearLogs');
  },
};
</script>

<style lang="css">
</style>
