<template>
  <farm-menu-bar>
    <template #left-menu>
      <router-link :to="{ name: 'tasks-all' }" tag="li">
        <icon-arrow-back/>
      </router-link>
      <li>{{ $t('Log Filters')}}</li>
    </template>
    <template #more-menu>
      <li @click="$emit('reset-filters')">{{ $t('Reset filters')}}</li>
    </template>
  </farm-menu-bar>
</template>

<script>
// TODO: Where to emit save-filters?
export default {
  name: 'TasksFilterMenuBar',
  data() {
    return {
      showMore: false,
    };
  },

};
</script>
