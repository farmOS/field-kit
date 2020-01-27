<template>
  <div class=body>
    <div id="container" class="cols">
      <homescreen-widgets :modules="modules"/>
    </div>
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
  #container {
      width: 100%;
      max-width: 700px;
      margin: 2em auto;
  }
  .cols {
      -moz-column-count:2;
      -moz-column-gap: 2%;
      -moz-column-width: 48%;
      -webkit-column-count:2;
      -webkit-column-gap: 2%;
      -webkit-column-width: 48%;
      column-count: 2;
      column-gap: 2%;
      column-width: 48%;
  }
</style>
