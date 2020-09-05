<template>
  <farm-menu-bar>
    <template #left-menu>
      <router-link :to="{ name: 'logs' }" tag="li">
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
