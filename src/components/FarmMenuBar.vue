<template>
  <header class="farm-menu-bar navbar navbar-light fixed-top">
    <ul class="left-menu">
      <slot name="left-menu"></slot>
    </ul>
    <ul class="right-menu">
      <slot name="right-menu"></slot>
      <li id="more-trigger" @click="openMoreMenu" v-if="more">
        <icon-more-vert/>
      </li>
    </ul>
    <ul id="more-menu" v-if="showMore">
      <slot name="more-menu"></slot>
    </ul>
  </header>
</template>

<script>
import IconMoreVert from './icons/icon-more-vert';

export default {
  name: 'FarmMenuBar',
  components: { IconMoreVert },
  props: {
    more: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      showMore: false,
    };
  },
  methods: {
    openMoreMenu(e) {
      e.stopPropagation();
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
    fill: white;
    border: none;
    height: 3rem;
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
