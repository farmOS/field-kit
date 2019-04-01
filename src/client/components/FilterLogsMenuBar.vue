<template>
  <header class="navbar navbar-light fixed-top">
    <ul class="left-menu">
      <router-link :to="{ name: 'logs' }">
        <li>
          <icon-arrow-back/>
        </li>
      </router-link>
      <li>Log Filters</li>
    </ul>
    <ul class="right-menu">
      <li @click="openMoreMenu">
        <icon-more-vert/>
      </li>
    </ul>
    <ul id="more-menu" v-if="showMore">
      <li @click="resetDisplayFilters">Reset filters</li>
    </ul>
  </header>
</template>

<script>
import IconArrowBack from '../../icons/icon-arrow-back.vue'; // eslint-disable-line import/extensions
import IconMoreVert from '../../icons/icon-more-vert.vue'; // eslint-disable-line import/extensions

export default {
  name: 'AllLogsMenuBar',
  components: {
    IconArrowBack,
    IconMoreVert,
  },
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
    resetDisplayFilters() {
      this.$store.dispatch('resetDisplayFilters');
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
    margin-left: 1rem;
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
</style>
