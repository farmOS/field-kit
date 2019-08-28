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
  props: {
    id: String,
    overrideStyles: Object,
    options: {
      type: Object,
      controls: [Boolean, Array, Function],
      interactions: [Boolean, Array, Function],
      default() {
        return {
          controls: true,
          interactions: true,
        };
      },
    },
    wkt: {
      title: String,
      wkt: String,
      color: String,
      visible: Boolean,
    },
    geojson: {
      title: String,
      url: String,
      color: String,
      visible: Boolean,
    },
  },
  mounted() {
    this.map = window.farmOS.map.create(this.id, this.options);
    if (this.geojson.url) {
      this.layers.geojson = this.map.addLayer('geojson', this.geojson);
    }
    if (this.geojson.url && !this.wkt.wkt) {
      this.layers.geojson.getSource().on('change', () => { this.map.zoomToVectors(); });
    }
    if (this.wkt.wkt) {
      this.layers.wkt = this.map.addLayer('wkt', this.wkt);
      this.map.zoomToLayer(this.layers.wkt);
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
      if (this.wkt.wkt) {
        this.layers.wkt = this.map.addLayer('wkt', this.wkt);
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
