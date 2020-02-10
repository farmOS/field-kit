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
    :wkt=mapLayers
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
  props: ['logs',
    'id',
    'systemOfMeasurement',
    'mapLayers'],

  computed: {
    areaGeoJSON() {
      return (process.env.NODE_ENV === 'development')
        ? 'http://localhost:8080/farm/areas/geojson/all'
        : `${localStorage.getItem('host')}/farm/areas/geojson/all`;
    },
    currentLog() {
      return this.logs.find(log => log.localID === +this.id) || this.logs[0];
    },
  },

  methods: {
    updateMovement(wkt) {
      const props = {
        movement: {
          area: this.currentLog?.movement.area,
          geometry: wkt,
        },
        localID: +this.id,
      };
      this.$store.dispatch('updateLog', props);
    },
  },
};
</script>

<style scoped>

</style>
