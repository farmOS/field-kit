<template>
  <!-- update row list-group drawer! -->
  <div>
    <homescreen-widgets :modules="modules"/>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

const HomescreenWidgets = Vue.component('homescreen-widgets', { // eslint-disable-line no-unused-vars
  render(createElement) {
    const self = this;
    return createElement('div', this.modules.map(module => createElement(
      `${module.name}-widget`,
      {
        nativeOn: {
          click() {
            self.$store.commit('setCurrentModule', module.name);
            self.$store.commit('filterLogs', log => log.modules.includes(module.name));
            self.$store.dispatch('loadCachedLogs');
          },
        },
      },
    )));
  },
  props: {
    modules: {
      type: Array,
      required: true,
    },
  },
});

export default {
  computed: mapState({
    modules: state => state.shell.modules,
  }),
};

</script>

<style scoped>
</style>
