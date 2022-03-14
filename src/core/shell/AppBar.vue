<template>
  <farm-app-bar :nav="nav" :title="title" :actions="actions" @menu="$emit('menu')">
    <template #status>
      <component :is="statusIcon" class="status"/>
    </template>
  </farm-app-bar>
</template>

<script>
import { computed } from 'vue';
import { validateAction, validateNav } from '../../components/FarmAppBar.vue';
import connection, { STATUS_GOOD_CONNECTION, STATUS_IN_PROGRESS, STATUS_NO_CONNECTION } from '../store/connection';

let state;

export const setActions = (arr = []) => {
  state.actions = arr.filter(validateAction);
};

export const setNav = (str) => {
  if (validateNav(str)) state.nav = str;
};

export const setTitle = (str) => {
  if (typeof str === 'string') state.title = str;
};

export const reset = () => {
  state.nav = 'menu';
  state.title = '';
  state.actions = [];
};

export default {
  name: 'AppBar',
  setup() {
    const statusIcon = computed(() => {
      if (connection.value === STATUS_GOOD_CONNECTION) return 'icon-cloud-done';
      if (connection.value === STATUS_NO_CONNECTION) return 'icon-cloud-off';
      if (connection.value === STATUS_IN_PROGRESS) return 'icon-cloud-sync';
      return 'icon-cloud-done';
    });
    return { statusIcon };
  },
  beforeCreate() {
    state = window.Vue.reactive({
      nav: 'menu',
      title: '',
      actions: [],
    });
  },
  computed: {
    nav() {
      return state.nav;
    },
    title() {
      return state.title;
    },
    actions() {
      return state.actions;
    },
  },
};
</script>

<style scoped>
  svg {
    fill: var(--white-transparent);
  }
</style>
