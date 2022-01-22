<template>
  <div class="app-container">
    <transition name="drawer">
      <app-drawer v-if="showDrawer" @hide-drawer="showDrawer = false"/>
    </transition>
    <transition name="modal">
      <app-modal v-if="showDrawer" @hide-modal="showDrawer = false"/>
    </transition>
    <slot name="menubar" @toggle-drawer="showDrawer = !showDrawer"></slot>
    <slot name="default" @toggle-drawer="showDrawer = !showDrawer"></slot>
    <app-alerts/>
  </div>
</template>

<script>
import AppAlerts from './AppAlerts.vue';
import AppDrawer from './AppDrawer.vue';
import AppModal from './AppModal.vue';

export default {
  name: 'AppShell',
  components: { AppAlerts, AppDrawer, AppModal },
  data() {
    return {
      showDrawer: false,
    };
  },
  watch: {
    showDrawer(currentShowDrawer) {
      if (currentShowDrawer) {
        document.querySelector('body').setAttribute('style', 'overflow-y: hidden');
      } else {
        document.querySelector('body').setAttribute('style', 'overflow-y: visible');
      }
    },
  },
};
</script>

<style>
  .drawer-enter-from, .drawer-leave-to {
    transform: translateX(-80vw);
  }

  .filter-enter-from, .filter-leave-to {
    opacity: 0;
  }

  .drawer-enter-active, .drawer-leave-active,
  .filter-enter-active, .filter-leave-active {
    transition: all .3s ease;
  }
</style>
