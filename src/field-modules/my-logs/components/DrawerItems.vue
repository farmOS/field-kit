<template>
  <farm-drawer-list>
    <router-link :to="{ name: 'logs' }">
      <farm-drawer-list-item>My Logs</farm-drawer-list-item>
    </router-link>
    <farm-drawer-list-item @click="openNewLog">New Log</farm-drawer-list-item>
  </farm-drawer-list>
</template>

<script>
export default {
  methods: {
    openNewLog() {
      const props = { modules: ['my-logs'], done: true };
      this.$store.dispatch('initializeLog', props)
        .then(id => this.$router.push({ path: `/logs/${id}` }));
    },
  },
};
</script>

<style scoped>
  a, a:hover {
    text-decoration: none;
    color: inherit;
  }
</style>
