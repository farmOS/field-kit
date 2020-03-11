<template>
  <drawer-list>
    <router-link :to="{ name: 'logs' }">
      <drawer-list-item>My Logs</drawer-list-item>
    </router-link>
    <drawer-list-item @click="openNewLog">New Log</drawer-list-item>
  </drawer-list>
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
