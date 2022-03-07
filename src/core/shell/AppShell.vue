<template>
  <div class="app-container">
    <transition name="drawer">
      <app-drawer v-if="showDrawer" ref="drawer" @close="showDrawer = false"/>
    </transition>
    <transition name="modal">
      <app-modal v-if="showDrawer" @click="modalClickHandler"/>
    </transition>
    <app-bar/>
    <slot name="default" :openDrawer="() => { showDrawer = true; }"></slot>
    <app-alerts/>
  </div>
</template>

<script>
import { alert } from '../store/errors';
import AppAlerts from './AppAlerts.vue';
import AppDrawer from './AppDrawer.vue';
import AppModal from './AppModal.vue';
import AppBar from './AppBar.vue';

export default {
  name: 'AppShell',
  components: {
    AppAlerts, AppDrawer, AppModal, AppBar,
  },
  provide() {
    return {
      openDrawer: this.openDrawer,
      alert,
    };
  },
  data() {
    return {
      showDrawer: false,
    };
  },
  methods: {
    openDrawer() {
      this.showDrawer = true;
    },
    modalClickHandler(evt) {
      if (!this.$refs.drawer.$el.contains(evt.target)) {
        this.showDrawer = false;
      }
    },
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

<style scoped>
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
