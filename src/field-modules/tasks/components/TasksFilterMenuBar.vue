<template>
  <farm-menu-bar>
    <template #left-menu>
      <li @click="returnToTasksAll">
        <icon-arrow-back/>
      </li>
      <li>{{ $t('Log Filters')}}</li>
    </template>
    <template #more-menu>
      <li @click="$emit('reset-filters')">{{ $t('Reset filters')}}</li>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'TasksFilterMenuBar',
  emits: ['reset-filters', 'save-filters'],
  data() {
    return {
      showMore: false,
    };
  },
  methods: {
    returnToTasksAll() {
      this.$emit('save-filters');
      this.$router.push({ name: 'tasks-all' });
    },
  },
};
</script>
