<template>
  <div id="home">
    <div class="container-fluid">
      <home-widgets :modules="modules" :logs="logs"/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

const fadeStyle = {
  position: 'absolute',
  top: '0px',
  right: '0px',
  height: '100%',
  width: '2rem',
  zIndex: '10',
  background: 'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50%)',
};

const HomeWidgets = Vue.component('home-widgets', { // eslint-disable-line no-unused-vars
  props: {
    modules: {
      type: Array,
      required: true,
    },
    logs: {
      type: Object,
      required: true,
    },
  },
  render(createElement) {
    const self = this;
    return createElement(
      'farm-tiles',
      {
        props: {
          columns: [1, 2, 3],
          breakpoints: [0, 600, 900],
          space: '1rem',
          overflow: 'hidden',
        },
      },
      this.modules.map(module => createElement(
        'farm-card',
        {
          nativeOn: {
            click() {
              self.$router.push(module.routes[0].path);
            },
          },
          style: {
            whiteSpace: 'nowrap',
            position: 'relative',
          },
        },
        [
          createElement('div', { style: fadeStyle }),
          createElement('h4', module.label),
          createElement(
            `${module.name}-widget`,
            { props: { logs: this.logs[module.name] } },
          ),
        ],
      )),
    );
  },
});

export default {
  name: 'Home',
  created() {
    this.$store.dispatch('loadHomeCachedLogs');
  },
  computed: mapState({
    modules: state => state.shell.modules,
    logs: state => state.farm.logs
      .reduce((logs, curLog) => ({
        ...logs,
        ...state.shell.modules.reduce((modLogs, curMod) => ({
          ...modLogs,
          [curMod.name]: curLog.modules.includes(curMod.name)
            ? logs[curMod.name]?.concat(curLog) || [curLog]
            : logs[curMod.name],
        }), {}),
      }), {}),
  }),
};

</script>

<style scoped>
  #home {
    background-color: #eee;
  }

  .container-fluid {
    max-width: 1200px;
    min-height: calc(100vh - 3rem);
    margin: auto;
    background-color: #eee;
    padding: 1rem;
  }
</style>
