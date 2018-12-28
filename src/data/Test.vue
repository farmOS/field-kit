<template lang="html">
  <div class="test">
    <h1>Test Component</h1>
    <button
      class="btn btn-info"
      type="button"
      name="assets"
      @click="getAssets"
    >
      Assets
    </button>
    <button
      class="btn btn-info"
      type="button"
      name="taxonomy"
      @click="getAreas"
    >
      Areas
    </button>
  </div>
</template>

<script>
export default {
  name: 'Test',
  methods: {
    getAssets() {
      console.log("CLICKED ASSETS!!!")
      this.$store.dispatch('getAssets')
    },
    getAreas() {
      console.log("CLICKED AREAS!!!")
      this.$store.dispatch('getAreas')
    },
  }
}
</script>

<style scoped>
</style>
