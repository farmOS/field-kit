<template>
  <div 
    :id="id"
    :style="[defaultStyles, style]">
  </div>
</template>

<script>
export default {
  name: 'Map',
  data() {
    return {
      // these can be overridden by the 'style' prop
      defaultStyles: {
        height: '100vw',
      }
    }
  },
  props: [
    'id',
    'style',
  ],
  mounted() {
    window.farmOS.map.create(this.id);
  }
}
</script>

<style>

</style>
