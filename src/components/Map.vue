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
          && (typeof e.visible === 'boolean'
          || e.visible === undefined)
        ) {
          return true;
        }
        return false;
      }),
      /*
      How do I validate an array?
      Trying a validator from https://michaelnthiessen.com/unlock-full-potential-prop-types/

      Alt: Do I need to use a factory function, like
      default: function () {
      return { message: 'hello' }
      }

      original code:
      title: String,
      wkt: String,
      color: String,
      visible: Boolean,
      */
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
    Add scripts to render asset geometry
    */
    this.map = window.farmOS.map.create(this.id, this.options);
    if (this.geojson.url) {
      this.layers.geojson = this.map.addLayer('geojson', this.geojson);
    }
    this.wkt.forEach((wktElement) => {
      console.log('WKTELEMENT');
      console.log(wktElement);
      /*
      Currently this writes subsequent WKTs over the old.
      I need to add new layers, and name them wktElement.title
      */
      if (!this.drawing && wktElement.wkt && wktElement.wkt !== 'GEOMETRYCOLLECTION EMPTY') {
        this.layers.wkt = this.map.addLayer('wkt', wktElement);
        this.map.zoomToLayer(this.layers.wkt);
      }
      if (this.geojson.url && (!wktElement.wkt || wktElement.wkt === 'GEOMETRYCOLLECTION EMPTY')) {
        this.layers.geojson.getSource().once('change', () => { this.map.zoomToVectors(); });
      }
      if (this.drawing) {
        if (wktElement.wkt && wktElement.wkt !== 'GEOMETRYCOLLECTION EMPTY') {
          this.layers.wkt = this.map.addLayer('wkt', wktElement);
          this.map.enableDraw({ layer: this.layers.wkt });
          this.map.zoomToLayer(this.layers.wkt);
        } else {
          this.map.enableDraw();
        }
        /*
        Here, wkt is declared by the map itself, then passed on in the emit statement
        the update-wkt event triggers updateMovement in editMap.
        I need to figure out what wkt consists of, and emit an object that denotes layers
        */
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
    });

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
      // I will need to remove multiple layers when multiple have been added
      if (!this.drawing) {
        if (this.layers.wkt) {
          this.map.map.removeLayer(this.layers.wkt);
          this.layers.wkt = null;
        }
        this.wkt.forEach((newElement) => {
          if (newElement.wkt && newElement.wkt !== 'GEOMETRYCOLLECTION EMPTY') {
            console.log('NEWELEMENT');
            console.log(newElement);
            /*
            This is a poor solution. It will add redundantly named layers from an array > 1
            I can address this by naming layers newElement.title
            */
            this.layers.wkt = this.map.addLayer('wkt', newElement);
            this.map.zoomToLayer(this.layers.wkt);
          } else {
            this.map.zoomToVectors();
          }
        });
      }
    },
  },
};
</script>

<style>

</style>
