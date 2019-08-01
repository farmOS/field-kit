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
      controls: (defaults) => defaults.filter(def => def.constructor.name === 'Attribution'),
      interactions: false,
    }
    this.map = window.farmOS.map.create(this.id, options);
  }
}
</script>

<style>

</style>
