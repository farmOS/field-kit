<template>
  <header class="navbar navbar-light fixed-top bg-light">
    <ul class="left">
      <li class="menu" @click="$emit('toggleDrawer')">
        <icon-menu/>
      </li>
      <li>Edit Log</li>
    </ul>
  </header>
</template>

<script>
import IconMenu from '../../icons/icon-menu.vue'; // eslint-disable-line import/extensions

export default {
  name: 'EditLogsMenuBar',
  components: { IconMenu },
};
</script>

<style scoped>
  .logo {
    max-height: 1.5rem;
  }

  header ul {
    display: flex;
    flex-flow: row nowrap;
    margin: 0;
    padding: 0;
  }

  ul.left {
    justify-content: flex-start;
  }

  header li {
    list-style: none;
    font-size: 1.25rem;
    line-height: 1.5rem;
    margin-right: .5rem;
  }
  .arrow-back, .menu {
    fill: var(--gray-dark);
  }
</style>
