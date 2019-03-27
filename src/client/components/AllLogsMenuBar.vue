<template>
  <header class="navbar navbar-light fixed-top bg-light">
    <div class="menu" @click="$emit('toggleDrawer')">
      <icon-menu/>
    </div>
    <img class="logo" src='../farmOS.png' alt="farmOS">
  </header>
</template>

<script>
import IconMenu from '../../icons/icon-menu.vue'; // eslint-disable-line import/extensions

export default {
  name: 'AllLogsMenuBar',
  components: { IconMenu },
};
</script>

<style scoped>
  .logo {
    max-height: 1.5rem;
  }
</style>
