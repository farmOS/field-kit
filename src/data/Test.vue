<template lang="html">
  <div class="test">
    <h1>Test Component</h1>
    <button
      class="btn btn-info"
      type="button"
      name="logs"
      @click="getLogs"
    >
      Logs
    </button>
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
      name="areas"
      @click="getAreas"
    >
      Areas
    </button>
    <button
      class="btn btn-info"
      type="button"
      name="authenticate"
      @click="authenticate"
    >
      Authenticate
    </button>
  </div>
</template>

<script>
export default {
  name: 'Test',
  methods: {
    getLogs() {
      console.log("CLICKED LOGS!!!")
      this.$store.dispatch('getLogs')
    },
    getAssets() {
      console.log("CLICKED ASSETS!!!")
      this.$store.dispatch('getAssets')
    },
    getAreas() {
      console.log("CLICKED AREAS!!!")
      this.$store.dispatch('getAreas')
    },
    authenticate() {
      console.log("CLICKED AUTHENTICATE!!!")
      // const payload = {
      //   host:
      //   user:
      //   password:
      // }
      this.$store.dispatch('authenticate')
    },
  }
}
</script>

<style scoped>
</style>
