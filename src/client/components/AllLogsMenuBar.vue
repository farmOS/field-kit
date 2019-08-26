<template>
  <menu-bar>
    <template #left-menu>
      <li @click="$emit('toggleDrawer')">
        <icon-menu/>
      </li>
      <li>My Logs</li>
    </template>
    <template #right-menu>
      <router-link :to="{ name: 'filter-logs' }" tag="li" class="filter">
        <icon-filter/>
      </router-link>
      <li @click="$emit('syncAll')">
        <icon-cloud-upload/>
      </li>
    </template>
    <template #more-menu>
      <li @click="$emit('syncAll')">Sync all logs</li>
      <router-link :to="{ name: 'filter-logs' }" tag="li" class="filter">
        Filter logs
      </router-link>
    </template>
  </menu-bar>
</template>

<script>
import MenuBar from './MenuBar.vue' // eslint-disable-line import/extensions
import IconCloudUpload from '../../icons/icon-cloud-upload.vue'; // eslint-disable-line import/extensions
import IconFilter from '../../icons/icon-filter.vue'; // eslint-disable-line import/extensions
import IconMenu from '../../icons/icon-menu.vue'; // eslint-disable-line import/extensions

export default {
  name: 'AllLogsMenuBar',
  components: {
    MenuBar,
    IconCloudUpload,
    IconFilter,
    IconMenu,
  },
};
</script>

<style scoped>
  .filter {
    padding: 2px;
  }

  .filter svg {
    height: 18px;
    width: 18px;
  }
</style>
