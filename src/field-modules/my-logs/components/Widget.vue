<template>

  <widget>
    <h4 class="card-title">My Logs Widget</h4>
    <h5
      @click="openMyLogs"
      :class="{ clickable: true }">
      All Logs
    </h5>
    <h5
      @click="openFilter"
      :class="{ clickable: true }">
      Filter Logs
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
    openMyLogs() {
      this.$router.push({ path: '/logs' });
    },
    openFilter() {
      this.$router.push({ name: 'filter-logs' });
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
