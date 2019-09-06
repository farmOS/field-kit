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
      editor: null,
      // these can be overridden by the 'overrideStyles' prop
      defaultStyles: {
        height: '100vw',
      }
    }
  },
  props: {
    id: String,
    overrideStyles: Object,
    edit: {
      type: Object,
      active: Boolean,
      draw: Boolean,
      drawType: String,
      modify: Boolean,
      snap: Boolean,
      default() {
        return {
          active: false,
          draw: true,
          drawType: 'Polygon',
          modify: true,
          snap: true,
        };
      },
    },
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
    if (this.edit.active) {
      this.editor = this.map.featureEditor({
        layer: this.layers.wkt,
        type: this.edit.drawType,
        color: 'blue',
        draw: this.edit.draw,
        snap: this.edit.snap,
        modify: this.edit.modify,
      });
      this.editor.wkt.on('drawend', (wkt) => {
        this.$emit('update-wkt', wkt);
      });
      this.editor.wkt.on('modifyend', (wkt) => {
        this.$emit('update-wkt', wkt);
      });
    }
  },
  beforeDestroy() {
    window.farmOS.map.destroy(this.id);
    this.map = null;
  },
  watch: {
    edit(newEdit, oldEdit) {
      if (newEdit.active && !oldEdit.active) {
        this.editor = this.map.featureEditor({
          layer: this.layers.wkt,
          type: this.edit.drawType,
          color: 'blue',
          draw: this.edit.draw,
          snap: this.edit.snap,
          modify: this.edit.modify,
        });
      }
      if (newEdit.active && oldEdit.active) {
        if ((newEdit.draw && !oldEdit.draw) || newEdit.drawType !== oldEdit.drawType) {
          this.editor.add('draw', newEdit.drawType);
          this.editor.wkt.on('drawend', (wkt) => {
            this.$emit('update-wkt', wkt);
          });
        }
        if (!newEdit.draw && oldEdit.draw) {
          this.editor.remove('draw');
        }
        if (newEdit.modify && !oldEdit.modify) {
          this.editor.add('modify')
          this.editor.wkt.on('modifyend', (wkt) => {
            this.$emit('update-wkt', wkt);
          });
        }
        if (!newEdit.modify && oldEdit.modify) {
          this.editor.remove('modify')
        }
        if (newEdit.snap && !oldEdit.snap) {
          this.editor.add('snap')
        }
        if (!newEdit.snap && oldEdit.snap) {
          this.editor.remove('snap')
        }
      }
    },
    wkt() {
      if (!this.edit.active) {
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
      }
    },
  },
}
</script>

<style>

</style>
