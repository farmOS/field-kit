<template>
  <Map
    id="map"
    :overrideStyles="{ height: 'calc(100vh - 3rem)' }"
    @update-wkt="updateMovement"
    :options="{
      controls: (defs) => defs.filter(def => def.constructor.name !== 'FullScreen'),
      drawing: true,
    }"
    :wkt="{
      title: 'movement',
      wkt: logs[currentLogIndex].movement.data.geometry,
      color: 'orange',
    }"
    :geojson="{
      title: 'areas',
      url: areaGeoJSON,
      color: 'grey',
    }"/>
</template>

<script>
import Map from './Map';

export default {
  name: 'EditMap',
  components: { Map },
  props: [ 'logs', 'id'],
  computed: {
    areaGeoJSON() {
      return (process.env.NODE_ENV === 'development') 
        ? 'http://localhost:8080/farm/areas/geojson/all'
        : `${localStorage.getItem('host')}/farm/areas/geojson/all`
    },
    currentLogIndex() {
      const index = this.logs.findIndex(log => log.local_id === +this.id);
      return index >= 0 ? index : 0;
    },
  },
  methods: {
    updateMovement(wkt) {
      const props = {
        movement: {
          data: {
            area: this.logs[this.currentLogIndex].movement.data.area,
            geometry: wkt,
          },
          changed: (Date.now() / 1000).toFixed(0)
        },
        isCachedLocally: false,
        wasPushedToServer: false,
      };
      this.$store.commit('updateLog', { index: this.currentLogIndex, props });
    },
  },
}
</script>

<style scoped>

</style>