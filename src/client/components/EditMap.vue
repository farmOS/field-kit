<template>
  <Map
    id="map"
    :overrideStyles="{ height: 'calc(100vh - 3rem)' }"
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
  }
}
</script>

<style scoped>

</style>