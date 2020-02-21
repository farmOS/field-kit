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
      },
    };
  },
  props: {
    id: String,
    overrideStyles: Object,
    drawing: Boolean,
    options: {
      type: Object,
      controls: [Boolean, Array, Function],
      interactions: [Boolean, Array, Function],
      units: String,
      default() {
        return {
          controls: true,
          interactions: true,
          units: 'us',
        };
      },
    },
    wkt: {
      type: Array,
      validator: wktArray => wktArray.every((e) => {
        if (
          typeof e.title === 'string'
          && (typeof e.wkt === 'string'
          || e.wkt === null)
          && typeof e.color === 'string'
          && (!e.visible
          || typeof e.visible === 'boolean')
        ) {
          return true;
        }
        return false;
      }),
    },
    geojson: {
      title: String,
      url: String,
      color: String,
      visible: Boolean,
    },
  },
  computed: mapState({
    /*
    Add asset geometry to state
    */
    mapboxAPIKey: state => state.shell.mapboxAPIKey,
  }),
  mounted() {
    /*
    Render asset geometry
    */
    this.map = window.farmOS.map.create(this.id, this.options);
    if (this.geojson.url) {
      this.layers.geojson = this.map.addLayer('geojson', this.geojson);
    }
    let hasLayers = false;
    this.wkt.forEach((wktElement) => {
      /*
      When a movement layer is present, zoom to the movement layer.
      Otherwise, zoom to the previous layer.
      */
      if (!this.drawing
        && wktElement.wkt
        && wktElement.wkt !== 'GEOMETRYCOLLECTION EMPTY'
        && wktElement.wkt !== null) {
        this.layers[wktElement.title] = this.map.addLayer('wkt', wktElement);
        if (hasLayers && this.layers.movement) {
          this.map.zoomToLayer(this.layers.movement);
        } else {
          this.map.zoomToLayer(this.layers[wktElement.title]);
          hasLayers = true;
        }
      }
      if (this.drawing) {
        if (wktElement.wkt
          && wktElement.wkt !== 'GEOMETRYCOLLECTION EMPTY'
          && wktElement.wkt !== null) {
          if (wktElement.title === 'movement') {
            this.layers[wktElement.title] = this.map.addLayer('wkt', wktElement);
            this.map.zoomToLayer(this.layers.movement);
            this.map.addBehavior('edit', { layer: this.layers.movement });
            this.map.addBehavior('measure', { layer: this.layers.movement });
          } else if (!hasLayers || !this.layers.movement) {
            this.layers[wktElement.title] = this.map.addLayer('wkt', wktElement);
            this.map.zoomToLayer(this.layers[wktElement.title]);
          } else {
            this.layers[wktElement.title] = this.map.addLayer('wkt', wktElement);
          }
          hasLayers = true;
        }
      }
    });
    if (this.drawing) {
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
    if (!hasLayers) {
      this.layers.geojson.getSource().once('change', () => { this.map.zoomToVectors(); });
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
    wkt: {
      handler(newWKT) {
        /*
        TODO:
        Figure out why this is triggering twice when a new area is added.
        */
        if (!this.drawing) {
          let hasLayers = false;
          newWKT.forEach((newElement) => {
            /*
            When multiple layers are present, the map zooms to the movement layer by default.
            */
            if (this.layers[newElement.title]) {
              this.map.map.removeLayer(this.layers[newElement.title]);
              this.layers[newElement.title] = null;
            }
            if (newElement.wkt
            && newElement.wkt !== 'GEOMETRYCOLLECTION EMPTY'
            && newElement.wkt !== null) {
              this.layers[newElement.title] = this.map.addLayer('wkt', newElement);
              if (hasLayers && this.layers.movement) {
                this.map.zoomToLayer(this.layers.movement);
              } else {
                this.map.zoomToLayer(this.layers[newElement.title]);
                hasLayers = true;
              }
            }
          });
          if (!hasLayers) {
            this.map.zoomToVectors();
          }
        }
      },
      deep: true,
    },
  },
};
</script>

<style>

</style>
