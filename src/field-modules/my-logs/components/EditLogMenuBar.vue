<template>
  <farm-menu-bar>
    <template #left-menu>
      <router-link :to="{ name: 'logs' }" tag="li">
        <icon-arrow-back/>
      </router-link>
      <li>Edit Log</li>
    </template>
    <template #right-menu>
      <a
        v-if="currentLog.url"
        :href="currentLog.url">
        <li>
          <icon-open-in-new/>
        </li>
      </a>
      <li @click="$emit('deleteCurrentLog', +id)">
        <icon-delete/>
      </li>
    </template>
    <template #more-menu>
      <a
        v-if="currentLog.url !==''"
        :href="currentLog.url">
        <li>Open in browser</li>
      </a>
      <li @click="$emit('deleteCurrentLog')">
        Delete from device
      </li>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'EditLogsMenuBar',
  props: ['logs', 'id'],
  computed: {
    currentLog() {
      return this.logs.find(log => log.localID === +this.id) || this.logs[0];
    },
  },
};
</script>
