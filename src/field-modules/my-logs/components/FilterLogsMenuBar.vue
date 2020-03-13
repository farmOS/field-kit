<template>
  <farm-menu-bar>
    <template #left-menu>
      <router-link :to="{ name: 'logs' }" tag="li">
        <icon-arrow-back/>
      </router-link>
      <li>Log Filters</li>
    </template>
    <template #more-menu>
      <li @click="resetDisplayFilters">Reset filters</li>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'AllLogsMenuBar',
  data() {
    return {
      showMore: false,
    };
  },
  methods: {
    resetDisplayFilters() {
      this.$emit('resetDisplayFilters');
    },
  },

};
</script>
