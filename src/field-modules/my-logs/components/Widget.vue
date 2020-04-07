<template>

  <div>
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
  </div>

</template>

<script>
export default {
  methods: {
    openMyLogs(e) {
      e.stopPropagation();
      this.$router.push({ path: '/logs' });
    },
    openFilter(e) {
      e.stopPropagation();
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
