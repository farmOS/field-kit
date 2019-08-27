<template>
  <menu-bar :more="false">
    <template #left-menu>
      <router-link :to="logLink" tag="li">
        <icon-arrow-back/>
      </router-link>
      <li>Map</li>
    </template>
  </menu-bar>
</template>

<script>
import MenuBar from './MenuBar.vue'; // eslint-disable-line import/extensions
import IconArrowBack from '../../icons/icon-arrow-back.vue'; // eslint-disable-line import/extensions

export default {
  name: 'EditMapMenuBar',
  components: { MenuBar, IconArrowBack },
  props: ['logs', 'currentLogIndex'],
  computed: {
    logLink() {
      return {
        name: 'edit-log',
        params: {
          index: this.currentLogIndex,
          type: this.logs[this.currentLogIndex].type.data,
        }
      }
    }
  }
}
</script>
