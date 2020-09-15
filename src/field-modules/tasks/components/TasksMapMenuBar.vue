<template>
  <farm-menu-bar :more="false">
    <template #left-menu>
      <router-link :to="logLink" tag="li">
        <icon-arrow-back/>
      </router-link>
      <li>Map</li>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'TasksMapMenuBar',
  props: ['logs', 'id'],
  computed: {
    logLink() {
      return {
        name: 'tasks-edit',
        params: {
          id: this.id,
          tab: 'SECOND',
        },
      };
    },
  },
};
</script>
