<template>
  <div id="home">
    <home-widgets :modules="modules"/>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

const HomeWidgets = Vue.component('home-widgets', { // eslint-disable-line no-unused-vars
  render(createElement) {
    const self = this;
    return createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexFlow: 'row wrap',
          maxWidth: '700px',
          minHeight: 'calc(100vh - 3rem)',
          margin: 'auto',
          backgroundColor: '#fff',
        },
      },
      this.modules.map(module => createElement(
        `${module.name}-widget`,
        {
          style: {
            flex: '0 0 50%',
            height: '50vw',
            maxHeight: '350px',
            backgroundColor: '#fff',
            border: '1px solid #eee',
          },
          nativeOn: {
            click() {
              self.$store.commit('setCurrentModule', module.name);
              self.$store.commit('filterLogs', log => log.modules.includes(module.name));
              self.$store.dispatch('loadCachedLogs');
            },
          },
        },
      )),
    );
  },
  props: {
    modules: {
      type: Array,
      required: true,
    },
  },
});

export default {
  name: 'Home',
  computed: mapState({
    modules: state => state.shell.modules,
  }),
};

</script>

<style scoped>
  #home {
    background-color: #eee;
  }
</style>
