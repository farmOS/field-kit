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
    window.farmOS.map.create(this.id);
  }
}
</script>

<style>

</style>
