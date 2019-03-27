<template>
  <header class="navbar navbar-light fixed-top">
    <ul class="left">
      <router-link :to="{ name: 'logs' }">
        <li>
          <icon-arrow-back/>
        </li>
      </router-link>
      <li>Edit Log</li>
    </ul>
    <ul class="right">
      <a :href="logs[currentLogIndex].remoteUri">
        <li>
          <icon-open-in-new/>
        </li>
      </a>
      <li>
        <icon-delete/>
      </li>
      <li>
        <icon-more-vert/>
      </li>
    </ul>
  </header>
</template>

<script>
import IconArrowBack from '../../icons/icon-arrow-back.vue'; // eslint-disable-line import/extensions
import IconDelete from '../../icons/icon-delete.vue'; // eslint-disable-line import/extensions
import IconMoreVert from '../../icons/icon-more-vert.vue'; // eslint-disable-line import/extensions
import IconOpenInNew from '../../icons/icon-open-in-new.vue'; // eslint-disable-line import/extensions

export default {
  name: 'EditLogsMenuBar',
  components: { IconArrowBack, IconDelete, IconMoreVert, IconOpenInNew },
  props: [ 'logs', 'currentLogIndex' ]
};
</script>

<style scoped>
  header {
    background-color: var(--farmos-green-dark);
    color: white;
    fill: white;
  }

  header svg {
    fill: white
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
