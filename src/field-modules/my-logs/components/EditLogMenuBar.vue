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
        v-if="logs[currentLogIndex] && logs[currentLogIndex].remoteUri"
        :href="logs[currentLogIndex].remoteUri">
        <li>
          <icon-open-in-new/>
        </li>
      </a>
      <li @click="$emit('deleteCurrentLog', currentLogIndex)">
        <icon-delete/>
      </li>
    </template>
    <template #more-menu>
      <a
        v-if="logs[currentLogIndex].remoteUri !==''"
        :href="logs[currentLogIndex].remoteUri">
        <li>Open in browser</li>
      </a>
      <li @click="$emit('deleteCurrentLog')">
        Delete from device
      </li>
    </template>
  </menu-bar>
</template>

<script>
import MenuBar from '@/client/components/MenuBar';
import IconArrowBack from '@/icons/icon-arrow-back';
import IconDelete from '@/icons/icon-delete';
import IconOpenInNew from '@/icons/icon-open-in-new';

export default {
  name: 'EditLogsMenuBar',
  components: { MenuBar, IconArrowBack, IconDelete, IconOpenInNew },
  props: [ 'logs', 'id' ],
  computed: {
    currentLogIndex() {
      const index = this.logs.findIndex(log => log.local_id === +this.id);
      return index >= 0 ? index : 0;
    },
  }
};
</script>
