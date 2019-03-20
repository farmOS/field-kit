<template lang="html">
  <div>
    <router-view
      :logs='logs'
      :areas='areas'
      :assets='assets'
      :currentLogIndex='currentLogIndex'
      :photoLoc='photoLoc'
      :geolocation='geolocation'
      :localArea='localArea'
      :useGeolocation='useGeolocation'
      :units='units'
      :userId='userId'
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: ['useGeolocation'],
  computed: mapState({
    logs: state => state.farm.logs,
    areas: state => state.farm.areas,
    assets: state => state.farm.assets,
    currentLogIndex: state => state.farm.currentLogIndex,
    statusText: state => state.farm.statusText,
    photoLoc: state => state.farm.photoLoc,
    geolocation: state => state.farm.geolocation,
    localArea: state => state.farm.localArea,
    units: state => state.farm.units,
    userId: state => state.shell.user.uid,
  }),
  beforeDestroy() {
    this.$store.commit('clearLogs');
  },
};
</script>

<style lang="css">
</style>
