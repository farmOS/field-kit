<template>
  <farm-app-bar :nav="nav" :title="title" :actions="actions"/>
</template>

<script>
import { validateAction, validateNav } from '../../components/FarmAppBar.vue';

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
