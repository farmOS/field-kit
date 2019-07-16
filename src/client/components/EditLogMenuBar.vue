<template>
  <header class="navbar navbar-light fixed-top">
    <ul class="left-menu">
      <router-link :to="{ name: 'logs' }">
        <li>
          <icon-arrow-back/>
        </li>
      </router-link>
      <li>Edit Log</li>
    </ul>
    <ul class="right-menu">
      <a
        v-if="logs[currentLogIndex] && logs[currentLogIndex].remoteUri"
        :href="logs[currentLogIndex].remoteUri">
        <li>
          <icon-open-in-new/>
        </li>
      </a>
      <li @click="$emit('deleteCurrentLog')">
        <icon-delete/>
      </li>
      <li @click="openMoreMenu">
        <icon-more-vert/>
      </li>
    </ul>
    <ul id="more-menu" v-if="showMore">
      <a
        v-if="logs[currentLogIndex].remoteUri !==''"
        :href="logs[currentLogIndex].remoteUri">
        <li>Open in browser</li>
      </a>
      <li @click="$emit('deleteCurrentLog')">
        Delete from device
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
  props: [ 'logs', 'currentLogIndex' ],
  data() {
    return {
      showMore: false,
    };
  },
  methods: {
    openMoreMenu() {
      this.showMore = true;
      document.addEventListener('click', this.handleClickOutside);
    },
    handleClickOutside(evt) {
      const moreMenu = document.getElementById('more-menu');
      if (moreMenu !== null && !moreMenu.contains(evt.target)) {
        this.showMore = false;
      }
    },
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside);
  },
};
</script>

<style scoped>
  header {
    background-color: var(--farmos-green-dark);
    color: white;
    border: none;
    height: 3rem;
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

  li {
    list-style: none;
    font-size: 1.25rem;
    line-height: 1.5rem;
  }

  .left-menu {
    justify-content: flex-start;
  }

  .left-menu li {
    margin-right: .5rem;
  }

  .right-menu {
    justify-content: flex-end;
  }

  .right-menu li {
    margin-left: .5rem;
  }

  #more-menu {
    position: absolute;
    top: 3px;
    right: 3px;
    flex-flow: column;
    background-color: white;
    color: var(--gray-dark);
    box-shadow: -1px 2px 5px rgba(0, 0, 0, .25);
  }

  #more-menu li {
    padding: 1rem 1rem;
    font-size: 1rem;
  }

  #more-menu a {
    color: var(--gray-dark);
  }
</style>
