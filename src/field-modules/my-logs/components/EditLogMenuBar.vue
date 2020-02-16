<template>
  <menu-bar>
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
  </menu-bar>
</template>

<script>
import MenuBar from '@/components/MenuBar';
import IconArrowBack from '@/components/icons/icon-arrow-back';
import IconDelete from '@/components/icons/icon-delete';
import IconOpenInNew from '@/components/icons/icon-open-in-new';

export default {
  name: 'EditLogsMenuBar',
  components: {
    MenuBar,
    IconArrowBack,
    IconDelete,
    IconOpenInNew,
  },
  props: ['logs', 'id'],
  computed: {
    currentLog() {
      return this.logs.find(log => log.localID === +this.id) || this.logs[0];
    },
  },
};
</script>
