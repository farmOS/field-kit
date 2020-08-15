<template>
  <farm-menu-bar>
    <template #left-menu>
      <li @click="$emit('toggleDrawer')">
        <icon-menu/>
      </li>
      <li>{{ $t('My Logs')}}</li>
    </template>
    <template #right-menu>
      <router-link :to="{ name: 'filter-logs' }" tag="li" class="filter">
        <icon-filter/>
      </router-link>
      <li @click="$emit('syncAll')">
        <icon-cloud-upload v-if="!isSyncing"/>
        <icon-sync-spin v-if="isSyncing"/>
      </li>
    </template>
    <template #more-menu>
      <li @click="$emit('syncAll')">{{ $t('Sync all logs')}}</li>
      <router-link :to="{ name: 'filter-logs' }" tag="li" class="filter">
        {{ $t('Filter logs')}}
      </router-link>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'AllLogsMenuBar',
  props: ['isSyncing'],
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
