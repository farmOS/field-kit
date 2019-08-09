<template>
  <div 
    :id="id"
    :style="[defaultStyles, overrideStyles]">
  </div>
</template>

<script>
export default {
  name: 'Map',
  data() {
    return {
      map: {},
      layers: {
        wkt: null,
        geojson: null,
      },
      // these can be overridden by the 'overrideStyles' prop
      defaultStyles: {
        height: '100vw',
      }
    }
  },
  props: [
    'id',
    'overrideStyles',
    'wkt',
    'geojson',
  ],
  mounted() {
    const options = {
      controls: (defaults) => defaults.filter(def => def.constructor.name === 'Attribution'),
      interactions: false,
    }
    this.map = window.farmOS.map.create(this.id, options);
    if (this.geojson) {
      this.layers.geojson = this.map.addLayer('geojson', {
        title: 'areas',
        url: this.geojson,
        color: 'grey',
      });
    }
    if (this.wkt) {
      this.layers.wkt = this.map.addLayer('wkt', {
        title: 'movement',
        wkt: this.wkt,
        color: 'orange',
      });
      this.map.zoomToLayer(this.layers.wkt);
    } else {
      this.map.zoomToVectors();
    }
  },
  beforeDestroy() {
    window.farmOS.map.destroy(this.id);
    this.map = null;
  },
  watch: {
    wkt() {
      if (this.layers.wkt) {
        this.map.map.removeLayer(this.layers.wkt);
        this.layers.wkt = null;
      }
      if (this.wkt) {
        this.layers.wkt = this.map.addLayer('wkt', {
          title: 'movement',
          wkt: this.wkt,
          color: 'orange',
        });
        this.map.zoomToLayer(this.layers.wkt);
      } else {
        this.map.zoomToVectors();
      }
    },
  },
}
</script>

<style>

</style>
