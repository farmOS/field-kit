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
    'wkt',
  ],
  mounted() {
    const options = {
      controls: (defaults) => defaults.filter(def => def.constructor.name === 'Attribution'),
      interactions: false,
    }
    this.map = window.farmOS.map.create(this.id, options);
    if (this.wkt) {
      this.map.addWKTLayer("movement", this.wkt, "orange");
    }
    this.map.zoomToVectors();
  },
  updated(){
    if (this.wkt) {
      this.map.addWKTLayer("movement", this.wkt, "orange");
    }
    this.map.zoomToVectors();
  },
}
</script>

<style>

</style>
