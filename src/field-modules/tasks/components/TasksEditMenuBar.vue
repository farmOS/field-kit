<template>
  <farm-menu-bar>
    <template #left-menu>
      <router-link :to="{ name: 'tasks-all' }" tag="li">
        <icon-arrow-back/>
      </router-link>
      <li>{{ $t('Edit Log')}}</li>
    </template>
    <template #right-menu>
      <a
        v-if="currentLog.url"
        :href="currentLog.url"
        target="_blank">
        <li>
          <icon-open-in-new/>
        </li>
      </a>
      <li @click="$emit('delete-current-log', +id)">
        <icon-delete/>
      </li>
      <li @click="$emit('sync', +id)">
        <icon-cloud-upload v-if="!isSyncing"/>
        <icon-sync-spin v-if="isSyncing"/>
      </li>
    </template>
    <template #more-menu>
      <a
        v-if="currentLog.url !==''"
        :href="currentLog.url"
        target="_blank">
        <li>{{ $t('Open in browser')}}</li>
      </a>
      <li @click="$emit('delete-current-log')">
       {{ $t('Delete from device')}}
      </li>
      <li @click="$emit('sync', +id)">
        {{ $t('Sync this log') }}
      </li>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'TasksEditMenuBar',
  props: ['logs', 'id', 'isSyncing'],
  computed: {
    currentLog() {
      return this.logs.find(log => log.localID === +this.id) || this.logs[0];
    },
  },
};
</script>
