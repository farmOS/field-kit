import Vue from 'vue';
import {
  compose, concat, evolve, map, mergeDeepWith, pick,
} from 'ramda';
import router from './router';
import routeMixin from './mixins/routeMixin';
import widgetMixin from './mixins/widgetMixin';

// Convert camelCase or PascalCase to kebab-case, based on:
// https://stackoverflow.com/a/67243723/1549703.
const kebabReplacer = (match, offset) =>
  (offset ? '-' : '') + match.toLowerCase();
const kebabRegex = /[A-Z]+(?![a-z])|[A-Z]/g;
const kebab = str => str.replace(kebabRegex, kebabReplacer);

const parseWidgetName = modName => widget =>
  (widget?.name ? kebab(widget.name) : `${kebab(modName)}-widget`);

// Functions for registering widget and main route components globally on the
// Vue instance and adding the routeMixin to each.
const registerRouteComponent = ({ name, mixins = [], ...rest }) =>
  Vue.component(kebab(name), { ...rest, mixins: [...mixins, routeMixin] });
const registerRoute = route => evolve({
  component: registerRouteComponent,
  components: map(registerRouteComponent),
  children: map(registerRoute),
}, route);
const registerWidgetComponent = compose(
  mod => Vue.component(mod.widget.name, mod.widget),
  mod => evolve({
    widget: {
      name: parseWidgetName(mod.name),
    },
  }, mod),
  mergeDeepWith(concat, { widget: { mixins: [widgetMixin] } }),
);

// Functions for parsing modules as config data that can be tracked in Vuex.
const parseComponent = ({ name }) => (name && kebab(name));
const parseRoute = route => compose(
  evolve({
    component: parseComponent,
    components: map(parseComponent),
    children: map(parseRoute),
  }),
  pick(['name', 'path', 'component', 'components', 'children', 'alias']),
)(route);
const parseModuleConfig = mod => evolve({
  routes: map(parseRoute),
  widget: parseWidgetName(mod.name),
}, mod);

// Main function called by modules to add their components and routes to the
// main Vue app and Vuex store.
export const mountFieldModule = store => (mod) => {
  const { routes = [] } = mod;
  const modConfig = parseModuleConfig(mod);
  store.commit('updateModuleConfig', modConfig);
  if (mod.widget) registerWidgetComponent(mod);
  router.addRoutes(routes.map(registerRoute));
};

// Takes module info from the API and uses it to inject a script tag and run
// a module's main entry file (eg, module.js).
export const loadFieldModule = ({ name, js }) =>
  new Promise((resolve, reject) => {
    const id = `field-module-${name}`;
    const prev = document.getElementById(id);
    if (prev !== null) { prev.remove(); }
    const script = document.createElement('script');
    script.id = id;
    script.src = `${localStorage.getItem('host')}/${js}`;
    script.type = 'module';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
