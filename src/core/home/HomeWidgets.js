import { h, reactive, resolveComponent } from 'vue';
import parseFilter from '../utils/parseFilter';

// Pass the children of a component VNode as the default slot of an object. See:
// https://v3.vuejs.org/guide/render-function.html#slots
const slotsDefault = slots => ({
  default(props) {
    return typeof slots === 'function' ? slots(props) : slots;
  },
});

const HomeWidgets = {
  name: 'home-widgets',
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
  render() {
    const self = this;
    return h(
      resolveComponent('farm-tiles'),
      {
        columns: [1, 2, 3],
        breakpoints: [0, 600, 900],
        space: 's',
      },
      slotsDefault(this.modules.map((mod) => {
        const filters = reactive({
          assets: {},
          logs: {},
          plans: {},
          quantities: {},
          terms: {},
          users: {},
        });
        const state = reactive({
          assets: self.assets.filter(parseFilter(filters.assets)),
          logs: self.logs.filter(parseFilter(filters.logs)),
          plans: self.plans.filter(parseFilter(filters.plans)),
          quantities: self.quantities.filter(parseFilter(filters.quantities)),
          terms: self.terms.filter(parseFilter(filters.terms)),
          users: self.users.filter(parseFilter(filters.users)),
        });
        const WidgetComponent = resolveComponent(mod.widget);
        return h(
          resolveComponent('farm-card'),
          {
            onClick() {
              self.$router.push(mod.routes[0].path);
            },
          },
          slotsDefault(() => ([
            h('h3', this.$t(mod.label)),
            h(
              WidgetComponent,
              {
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
                onClick() {
                  self.$router.push(mod.routes[0].path);
                },
                onSetWidgetFilter({ entity, filter }) {
                  filters[entity] = filter;
                },
              },
            ),
          ])),
        );
      })),
    );
  },
};

export default HomeWidgets;
