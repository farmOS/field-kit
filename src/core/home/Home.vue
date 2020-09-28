<template>
  <farm-main>
    <home-widgets
    :modules="modules"
    :logs="filteredLogs"
    :assets="assets"
    :userId="userId"
    @set-module-filters="setModuleFilters"/>
  </farm-main>
</template>

<script>
import Vue from 'vue';
import createQuery from '../../utils/createQuery';

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
    assets: {
      type: Array,
      required: true,
    },
    userId: [String, Number],
  },
  render(createElement) {
    const self = this;
    return createElement(
      'farm-tiles',
      {
        props: {
          columns: [1, 2, 3],
          breakpoints: [0, 600, 900],
          space: 's',
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
        },
        [
          createElement('h3', this.$t(module.label)),
          createElement(
            `${module.name}-widget`,
            {
              props: {
                logs: this.logs[module.name] || [],
                assets: this.assets || [],
                userId: this.userId,
              },
              on: {
                [`load-${module.name}-logs`](filter) {
                  self.$emit('set-module-filters', { [module.name]: filter });
                  self.$store.dispatch('loadLogs', { filter });
                },
              },
            },
          ),
        ],
      )),
    );
  },
});

export default {
  name: 'Home',
  props: ['modules', 'logs', 'assets', 'userId'],
  data() {
    return {
      filters: {},
    };
  },
  computed: {
    filteredLogs() {
      return Object.entries(this.filters)
        .reduce((logs, [name, filters]) => {
          const query = createQuery(filters);
          return {
            ...logs,
            [name]: this.logs.filter(query),
          };
        }, {});
    },
  },
  methods: {
    setModuleFilters(e) {
      this.filters = { ...this.filters, ...e };
    },
  },
};

</script>
