<template lang="html">
  <div>
    <div v-if='showEditLog'>
      <EditLog
        :logs='logs'
        :areas='areas'
        :assets='assets'
        :currentLogIndex='currentLogIndex'
        :isWorking='isWorking'
        :statusText='statusText'
        :photoLoc='photoLoc'
        :geolocation='geolocation'
        v-on:view-all='toggleLogs'
      />
    </div>
    <div v-if='showAllLogs'>
      <AllLogs
        :logs='logs'
        v-on:create-log='toggleLogs'
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AllLogs from './AllLogs';
import EditLog from './EditLog';

export default {
  data() {
    return {
      showEditLog: false,
      showAllLogs: true,
    };
  },
  computed: mapState({
    logs: state => state.farm.logs,
    areas: state => state.farm.areas,
    assets: state => state.farm.assets,
    currentLogIndex: state => state.farm.currentLogIndex,
    isWorking: state => state.farm.isWorking,
    statusText: state => state.farm.statusText,
    photoLoc: state => state.farm.photoLoc,
    geolocation: state => state.farm.geolocation,
  }),
  components: {
    AllLogs,
    EditLog,
  },
  methods: {
    toggleLogs() {
      this.showEditLog = !this.showEditLog;
      this.showAllLogs = !this.showAllLogs;
    },
  },
  beforeDestroy() {
    this.$store.commit('clearLogs');
  },
};
</script>

<style lang="css">
</style>
