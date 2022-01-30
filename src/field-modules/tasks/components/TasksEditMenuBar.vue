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
        v-if="log.url"
        :href="log.url"
        target="_blank">
        <li>
          <icon-open-in-new/>
        </li>
      </a>
      <li @click="$emit('delete-current-log', id)">
        <icon-delete/>
      </li>
      <li @click="$emit('sync', id)">
        <icon-cloud-upload v-if="!isSyncing"/>
        <icon-sync-spin v-if="isSyncing"/>
      </li>
    </template>
    <template #more-menu>
      <a
        v-if="log.url !==''"
        :href="log.url"
        target="_blank">
        <li>{{ $t('Open in browser')}}</li>
      </a>
      <li @click="$emit('delete-current-log')">
       {{ $t('Delete from device')}}
      </li>
      <li @click="$emit('sync', id)">
        {{ $t('Sync this log') }}
      </li>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'TasksEditMenuBar',
  emits: ['delete-current-log', 'sync'],
  props: ['logs', 'id', 'isSyncing'],
  computed: {
    log() {
      return this.logs.find(l => l.id === this.id) || {};
    },
  },
};
</script>
