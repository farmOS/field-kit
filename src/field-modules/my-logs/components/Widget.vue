<template>

  <widget>
    <h4 class="card-title">My Logs Widget</h4>
    <h5
      @click="openMyLogs"
      class="clickable">
      All Logs
      <IconAssignment class="inline-svg"/>
    </h5>
    <h5
      @click="openFilter"
      class="clickable">
      Filter Logs
      <IconFilter class="inline-svg"/>
    </h5>
  </widget>

</template>

<script>
import Widget from '@/components/Widget';
import IconAssignment from '@/components/icons/icon-assignment';
import IconFilter from '@/components/icons/icon-filter';

export default {
  components: {
    Widget,
    IconAssignment,
    IconFilter,
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
