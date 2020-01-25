<template>
  <widget>
    <h4 class="card-title">Weather Widget</h4>
    <h5
      @click="openWeather"
      :class="{ clickable: true }">
      Weather
    </h5>
  </widget>
</template>

<script>
import Widget from '@/components/Widget';

export default {
  components: {
    Widget,
  },
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
