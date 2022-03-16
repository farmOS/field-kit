<template>
  <div class="app-container">
    <app-bar @menu="openDrawer"/>
    <app-drawer ref="drawer"/>
    <slot name="default"></slot>
    <app-alerts/>
  </div>
</template>

<script>
import { alert } from '../warnings/alert';
import AppAlerts from './AppAlerts.vue';
import AppDrawer from './AppDrawer.vue';
import AppBar from './AppBar.vue';

export default {
  name: 'AppShell',
  components: {
    AppAlerts, AppDrawer, AppBar,
  },
  provide() {
    return {
      alert,
    };
  },
  methods: {
    openDrawer() {
      this.$refs.drawer.openDrawer();
    },
  },
};
</script>
