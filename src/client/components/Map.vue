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
      // these can be overridden by the 'overrideStyles' prop
      defaultStyles: {
        height: '100vw',
      }
    }
  },
  props: [
    'id',
    'overrideStyles',
  ],
  mounted() {
    const options = {
      interactions: {
        mouseWheelZoom: false,
        dragPan: false,
      },
      controls: {
        zoom: false,
        fullScreen: false,
        // 'o' === 'geocoder' 🙄
        o: false,
        layerSwitcher: false,
      },
    };
    this.map = window.farmOS.map.create(this.id, options);
  }
}
</script>

<style>

</style>
