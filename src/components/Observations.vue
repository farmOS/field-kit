<template lang="html">
  <div>
    <div v-if='showEditObs'>
      <EditObservation
        :logs='logs'
        :currentLogIndex='currentLogIndex'
        :isWorking='isWorking'
        :statusText='statusText'
        :photoLoc='photoLoc'
        :isOnline='isOnline'

        v-on:view-all='toggleObs'
      />
    </div>
    <div v-if='showAllObs'>
      <AllObservations
        :logs='logs'
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
  computed: mapState({
    logs: state => state.farm.logs,
    currentLogIndex: state => state.farm.currentLogIndex,
    isWorking: state => state.farm.isWorking,
    statusText: state => state.farm.statusText,
    photoLoc: state => state.farm.photoLoc,
    isOnline: state => state.user.isOnline,
  }),
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
