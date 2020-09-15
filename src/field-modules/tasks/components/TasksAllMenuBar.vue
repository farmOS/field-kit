<template>
  <farm-menu-bar>
    <template #left-menu>
      <li @click="$emit('toggle-drawer')">
        <icon-menu/>
      </li>
      <li>{{ $t('Tasks')}}</li>
    </template>
    <template #right-menu>
      <router-link :to="{ name: 'tasks-filter' }" tag="li" class="filter">
        <icon-filter/>
      </router-link>
      <li @click="$emit('sync-all')">
        <icon-cloud-upload v-if="!isSyncing"/>
        <icon-sync-spin v-if="isSyncing"/>
      </li>
    </template>
    <template #more-menu>
      <li @click="$emit('sync-all')">{{ $t('Sync all logs')}}</li>
      <router-link :to="{ name: 'tasks-filter' }" tag="li" class="filter">
        {{ $t('Filter logs')}}
      </router-link>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'TasksAllMenuBar',
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
