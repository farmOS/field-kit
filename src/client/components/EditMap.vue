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
  props: [ 'logs', 'currentLogIndex'],
  computed: {
    areaGeoJSON() {
      return (process.env.NODE_ENV === 'development') 
        ? 'http://localhost/farm/areas/geojson/all'
        : `${localStorage.getItem('host')}/farm/areas/geojson/all`
    },
  },
  methods: {
    updateMovement(wkt) {
      const newProps = {
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
      this.$store.commit('updateCurrentLog', newProps);
    },
  },
}
</script>

<style scoped>

</style>