<template>
  <farm-widget>
    <h4 class="card-title">Weather Widget</h4>
    <h5
      @click="openWeather"
      class="clickable">
      Log Weather
      <IconRaindrops class="inline-svg"/>
    </h5>
  </farm-widget>
</template>

<script>
export default {
  methods: {
    openWeather() {
      this.$router.push({ path: '/weather' });
    },
  },
};
</script>

<style scoped>

.clickable:hover {
  background-color: #eee;
  cursor: pointer;
}

</style>
