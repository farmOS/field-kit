import Vue from 'vue';
import parseFilter from '../utils/parseFilter';

const HomeWidgets = Vue.component('home-widgets', {
  props: [
    'modules',
    'user',
    'farm',
    'settings',
    'assets',
    'logs',
    'plans',
    'quantities',
    'terms',
    'users',
    'assetTypes',
    'logTypes',
    'planTypes',
    'quantityTypes',
    'termTypes',
    'userTypes',
    'areaGeoJSON',
  ],
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
      this.modules.map((module) => {
        const filters = Vue.observable({
          assets: {},
          logs: {},
          plans: {},
          quantities: {},
          terms: {},
          users: {},
        });
        const state = Vue.observable({
          assets: self.assets.filter(parseFilter(filters.assets)),
          logs: self.logs.filter(parseFilter(filters.logs)),
          plans: self.plans.filter(parseFilter(filters.plans)),
          quantities: self.quantities.filter(parseFilter(filters.quantities)),
          terms: self.terms.filter(parseFilter(filters.terms)),
          users: self.users.filter(parseFilter(filters.users)),
        });
        return createElement(
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
              module.widget,
              {
                props: {
                  user: this.user,
                  farm: this.farm,
                  settings: this.settings,
                  assets: state.assets || [],
                  logs: state.logs || [],
                  plans: state.plans || [],
                  quantities: state.quantities || [],
                  terms: state.terms || [],
                  users: state.users || [],
                  assetTypes: this.assetTypes,
                  logTypes: this.logTypes,
                  planTypes: this.planTypes,
                  quantityTypes: this.quantityTypes,
                  termTypes: this.termTypes,
                  userTypes: this.userTypes,
                  areaGeoJSON: this.areaGeoJSON,
                },
                on: {
                  'set-widget-filter': ({ entity, filter }) => {
                    filters[entity] = filter;
                  },
                },
              },
            ),
          ],
        );
      }),
    );
  },
});

export default HomeWidgets;
