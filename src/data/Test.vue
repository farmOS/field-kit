<template lang="html">
  <div class="test">
    <h1>Test Component</h1>
    <button
      class="btn btn-info"
      type="button"
      name="logs"
      @click="getLogs"
    >
      Get Logs
    </button>
    <button
      class="btn btn-info"
      type="button"
      name="assets"
      @click="getAssets"
    >
      Get Assets
    </button>
    <button
      class="btn btn-info"
      type="button"
      name="areas"
      @click="getAreas"
    >
      Get Areas
    </button>
    <button
      class="btn btn-info"
      type="button"
      name="authenticate"
      @click="authenticate"
    >
      Authenticate
    </button>
    <br>
    <button
      class="btn btn-info"
      type="button"
      name="assets"
      @click="addAssets"
    >
      Add Assets
    </button>
    <button
      class="btn btn-info"
      type="button"
      name="areas"
      @click="addAreas"
    >
      Add Areas
    </button>
    <br>
    <button
      class="btn btn-info"
      type="button"
      name="assets"
      @click="updateAsset"
    >
      Update Asset #2
    </button>
    <button
      class="btn btn-info"
      type="button"
      name="areas"
      @click="updateArea"
    >
      Update Area #2
    </button>
  </div>
</template>

<script>
export default {
  name: 'Test',
  methods: {
    authenticate() {
      console.log("CLICKED AUTHENTICATE!!!")
      this.$store.dispatch('authenticate')
    },
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
    addAssets() {
      const newAssets = [
        {
          id: 1,
          name: "cow #1",
        },
        {
          id: 2,
          name: "cow #2",
        },
        {
          id: 3,
          name: "cow #3",
        },
        {
          id: 4,
          name: "cow #4",
        },
        {
          id: 5,
          name: "cow #5",
        },
      ]
      console.log("CLICKED ASSETS!!!")
      this.$store.commit('addAssets', newAssets)
    },
    addAreas() {
      const newAreas = [
        {
          id: 1,
          name: "field #1",
        },
        {
          id: 2,
          name: "field #2",
        },
        {
          id: 3,
          name: "field #3",
        },
        {
          id: 4,
          name: "field #4",
        },
        {
          id: 5,
          name: "field #5",
        },
      ]
      console.log("CLICKED AREAS!!!")
      this.$store.commit('addAreas', newAreas)
    },
    updateAsset() {
      const newAsset = { id: 2, name: "pig #42"}
      this.$store.commit('updateAsset', newAsset)
    },
    updateArea() {
      const newArea = { id: 2, name: "greenhouse #42"}
      this.$store.commit('updateArea', newArea)
    },
  }
}
</script>

<style scoped>
</style>
