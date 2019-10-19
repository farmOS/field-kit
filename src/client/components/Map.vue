<template>
  <div 
    :id="id"
    :style="[defaultStyles, overrideStyles]">
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Map',
  data() {
    return {
      map: {},
      layers: {
        wkt: null,
        geojson: null,
        mapbox: null,
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
      drawing: Boolean,
      default() {
        return {
          controls: true,
          interactions: true,
          drawing: false,
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
  computed: mapState({
    mapboxAPIKey: state => state.shell.mapboxAPIKey,
  }),
  mounted() {
    this.map = window.farmOS.map.create(this.id, this.options);
    if (this.geojson.url) {
      this.layers.geojson = this.map.addLayer('geojson', this.geojson);
    }
    if (!this.options.drawing && this.wkt.wkt && this.wkt.wkt !== 'GEOMETRYCOLLECTION EMPTY') {
      this.layers.wkt = this.map.addLayer('wkt', this.wkt);
      this.map.zoomToLayer(this.layers.wkt);
    } 
    if (this.geojson.url && (!this.wkt.wkt || this.wkt.wkt === 'GEOMETRYCOLLECTION EMPTY')) {
      this.layers.geojson.getSource().once('change', () => { this.map.zoomToVectors(); });
    }
    if (this.options.drawing) {
      if (this.wkt.wkt && this.wkt.wkt !== 'GEOMETRYCOLLECTION EMPTY') {
        this.map.edit.setWKT(this.wkt.wkt);
        this.map.zoomToLayer(this.map.edit.layer);
      }
      this.map.edit.wktOn('drawend', (wkt) => {
        this.$emit('update-wkt', wkt);
      });
      this.map.edit.wktOn('modifyend', (wkt) => {
        this.$emit('update-wkt', wkt);
      });
      this.map.edit.wktOn('translateend', (wkt) => {
        this.$emit('update-wkt', wkt);
      });
      this.map.edit.wktOn('delete', (wkt) => {
        this.$emit('update-wkt', wkt);
      });
    }
    if (this.mapboxAPIKey) {
      const mapboxOpts = {
        title: 'MapBox Satellite',
        url: `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=${this.mapboxAPIKey}`,
        group: 'Base layers',
        base: true,
        visible: true,
      };
      this.layers.mapbox = this.map.addLayer('xyz', mapboxOpts);
    }
  },
  beforeDestroy() {
    window.farmOS.map.destroy(this.id);
    this.map = null;
  },
  watch: {
    wkt(newWKT) {
      if (!this.options.drawing) {
        if (this.layers.wkt) {
          this.map.map.removeLayer(this.layers.wkt);
          this.layers.wkt = null;
        }
        if (this.wkt.wkt && this.wkt.wkt !== 'GEOMETRYCOLLECTION EMPTY') {
          this.layers.wkt = this.map.addLayer('wkt', newWKT);
          this.map.zoomToLayer(this.layers.wkt);
        } else {
          this.map.zoomToVectors();
        }
      } else {
        this.map.edit.setWKT(newWKT.wkt);
      }
    },
  },
}
</script>

<style>

</style>
