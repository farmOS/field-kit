<template>
  <Map
    id="map"
    :overrideStyles="{ height: 'calc(100vh - 3rem)' }"
    @update-wkt="updateMovement"
    :drawing="true"
    :options="{
      controls: (defs) => defs.filter(def => def.constructor.name !== 'FullScreen'),
      units: systemOfMeasurement,
    }"
    :wkt="{
      title: 'movement',
      wkt: logs[currentLogIndex].movement
        ? logs[currentLogIndex].movement.geometry
        : undefined,
      color: 'orange',
    }"
    :geojson="{
      title: 'areas',
      url: areaGeoJSON,
      color: 'grey',
    }"/>
</template>

<script>
import Map from '@/components/Map';

export default {
  name: 'EditMap',
  components: { Map },
  props: ['logs', 'id', 'systemOfMeasurement'],
  computed: {
    areaGeoJSON() {
      return (process.env.NODE_ENV === 'development')
        ? 'http://localhost:8080/farm/areas/geojson/all'
        : `${localStorage.getItem('host')}/farm/areas/geojson/all`;
    },
    currentLogIndex() {
      const index = this.logs.findIndex(log => log.localID === +this.id);
      return index >= 0 ? index : 0;
    },
  },
  methods: {
    updateMovement(wkt) {
      const props = {
        movement: {
          area: this.logs[this.currentLogIndex]?.movement.area,
          geometry: wkt,
        },
      };
      this.$store.dispatch('updateLog', { index: this.currentLogIndex, props });
    },
  },
};
</script>

<style scoped>

</style>
