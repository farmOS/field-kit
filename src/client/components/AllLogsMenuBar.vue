<template>
  <header class="navbar navbar-light fixed-top">
    <ul class="left">
      <li class="menu" @click="$emit('toggleDrawer')">
        <icon-menu/>
      </li>
      <li>My Logs</li>
    </ul>
    <ul class="right">
      <li @click="$emit('syncAll')">
        <icon-cloud-upload/>
      </li>
      <li>
        <icon-more-vert/>
      </li>
    </ul>
  </header>
</template>

<script>
import IconCloudUpload from '../../icons/icon-cloud-upload.vue'; // eslint-disable-line import/extensions
import IconMenu from '../../icons/icon-menu.vue'; // eslint-disable-line import/extensions
import IconMoreVert from '../../icons/icon-more-vert.vue'; // eslint-disable-line import/extensions

export default {
  name: 'AllLogsMenuBar',
  components: { IconMenu, IconCloudUpload, IconMoreVert },
};
</script>

<style scoped>
  header {
    background-color: var(--farmos-green-dark);
    color: white;
    fill: white;
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

  ul.left li {
    margin-right: .5rem;
  }

  ul.right {
    justify-content: flex-end;
  }

  ul.right li {
    margin-left: .5rem;
  }

  li {
    list-style: none;
    font-size: 1.25rem;
    line-height: 1.5rem;
  }
</style>
