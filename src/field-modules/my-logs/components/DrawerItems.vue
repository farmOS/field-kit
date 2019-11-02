<template>
  <ul class="row list-group drawer">
    <router-link :to="{ name: 'logs' }">
      <li class="list-group-item">My Logs</li>
    </router-link>
    <li class="list-group-item" @click="openNewLog">New Log</li>
  </ul>
</template>

<script>
import modConfig from '../module.config'
export default {
  name: `${modConfig.name}-drawer-items`,
  methods: {
    openNewLog() {
      const timestamp = Math.floor(new Date() / 1000).toString();
      this.$store.dispatch('initializeLog', {
        type: { data: 'farm_activity', changed: timestamp },
        timestamp: { data: timestamp, changed: timestamp },
      }).then(id => this.$router.push({ path: `/logs/${id}`}));
    },
  }
}
</script>

<style scoped>
  a {
    text-decoration: none;
    color: inherit;
  }
</style>