<template>
  <header class="farm-app-bar navbar navbar-light fixed-top">
    <ul class="main-nav">
      <li class="nav-control" @click="handleNavControl">
        <icon-arrow-back v-if="navBack"/>
        <icon-menu v-else/>
      </li>
      <li class="title">{{title}}</li>
    </ul>
    <ul class="actions">
      <li v-if="$slots.status" class="status">
        <slot name="status"></slot>
      </li>
      <li v-for="(a, i) in acts.show" :key="`app-bar-action-${i}`" @click="a.onClick">
        <component :is="a.icon"/>
      </li>
      <li id="open-overflow" @click="openOverflow" v-if="acts.flow.length > 0">
        <icon-more-vert/>
      </li>
    </ul>
    <ul id="overflow" v-if="showOverflow">
      <li v-for="(a, i) in acts.flow" :key="`app-bar-action-${i}`" @click="a.onClick">
        {{action.text}}
      </li>
    </ul>
  </header>
</template>

<script>
import IconMoreVert from './icons/icon-more-vert.vue';
import IconArrowBack from './icons/icon-arrow-back.vue';
import IconMenu from './icons/icon-menu.vue';

const rem = 16;
const liMargin = rem / 2;
const padding = rem * 2;
const iconWidth = 24 + liMargin;

export const validateAction = ({ icon, onClick, text }) => (
  typeof icon === 'string'
    && typeof onClick === 'function'
    && typeof text === 'string'
);
export const validateNav = str => ['menu', 'back'].includes(str);

export default {
  name: 'FarmAppBar',
  components: { IconMoreVert, IconArrowBack, IconMenu },
  props: {
    nav: {
      type: String,
      default: 'menu',
      validator: validateNav,
    },
    title: String,
    actions: {
      type: Array,
      default: () => [],
      validator: arr => arr.every(validateAction),
    },
  },
  data() {
    return {
      showOverflow: false,
      startOverflow: 0,
    };
  },
  computed: {
    navBack() {
      return this.nav === 'back';
    },
    acts() {
      const show = this.actions.slice(0, this.startOverflow);
      const flow = this.actions.slice(this.startOverflow);
      return { show, flow };
    },
  },
  created() {
    window.addEventListener('resize', this.calcOverflow);
    this.calcOverflow();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calcOverflow);
  },
  methods: {
    calcOverflow() {
      const titleWidth = this.title.length * rem;
      const availableWidth = window.innerWidth - padding - iconWidth - titleWidth;
      const maxIcons = Math.floor(availableWidth / iconWidth);
      if (this.actions.length > maxIcons) {
        this.startOverflow = this.actions.length;
      } else {
        this.startOverflow = maxIcons - 1;
      }
    },
    handleNavControl() {
      if (this.navBack) {
        this.$router.back();
      } else {
        this.$emit('menu', true);
      }
    },
    openOverflow(evt) {
      evt.stopPropagation();
      this.showOverflow = true;
      document.addEventListener('click', this.handleClickOutside);
    },
    handleClickOutside(evt) {
      const moreMenu = document.getElementById('overflow');
      if (moreMenu !== null && !moreMenu.contains(evt.target)) {
        this.showOverflow = false;
      }
    },
  },
  unmounted() {
    document.removeEventListener('click', this.handleClickOutside);
  },
};
</script>

<style scoped>
  header {
    background-color: var(--primary);
    color: var(--white);
    border: none;
    height: 3rem;
  }

  header ul {
    display: flex;
    flex-flow: row nowrap;
    margin: 0;
    padding: 0;
  }

  svg {
    fill: var(--white);
  }

  li {
    list-style: none;
    font-size: 1.25rem;
    line-height: 1.5rem;
  }

  .main-nav {
    justify-content: flex-start;
  }

  .main-nav li {
    margin-right: .5rem;
  }

  .actions {
    justify-content: flex-end;
  }

  .actions li {
    margin-left: .5rem;
  }

  #overflow {
    position: absolute;
    top: 3px;
    right: 3px;
    flex-flow: column;
    background-color: var(--white);
    color: var(--text);
    box-shadow: var(--shadow);
  }

  #overflow li {
    padding: 1rem 1rem;
    font-size: 1rem;
  }

  #overflow a {
    color: var(--text);
  }
</style>
