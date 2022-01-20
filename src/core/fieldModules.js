import {
  compose, curry, evolve, map, path, pick,
} from 'ramda';
import { getHost } from './remote';
import farm from './farm';
import routeMixin from './mixins/routeMixin';
import widgetMixin from './mixins/widgetMixin';

// Convert camelCase or PascalCase to kebab-case, based on:
// https://stackoverflow.com/a/67243723/1549703.
const kebabReplacer = (match, offset) =>
  (offset ? '-' : '') + match.toLowerCase();
const kebabRegex = /[A-Z]+(?![a-z])|[A-Z]/g;
const kebab = str => str.replace(kebabRegex, kebabReplacer);

const parseWidgetName = curry((modName, widget) =>
  (widget?.name ? kebab(widget.name) : `${kebab(modName)}-widget`));

// Functions for registering widget and main route components globally on the
// application instance and adding the routeMixin to each.
const addMixin = mixin => evolve({
  component: c => ({ ...c, mixins: [...(c.mixins || []), mixin] }),
  components: map(c => ({ ...c, mixins: [...(c.mixins || []), mixin] })),
});
const withRouteMixin = addMixin(routeMixin);
const withWidgetMixn = addMixin(widgetMixin);
const registerWidget = (app, modName, widget) => {
  app.component(
    parseWidgetName(modName, widget),
    withWidgetMixn(widget),
  );
};

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
export const mountFieldModule = deps => (mod) => {
  const { app, router, store } = deps;
  const { routes = [], widget } = mod;
  const modConfig = parseModuleConfig(mod);
  store.commit('updateModuleConfig', modConfig);
  if (widget) registerWidget(app, mod.name, widget);
  routes.forEach((route) => {
    router.addRoute(withRouteMixin(route));
  });
};

// Takes module info from the API and uses it to inject a script tag and run
// a module's main entry file (eg, module.js).
export const loadFieldModule = ({ name, uri }) =>
  new Promise((resolve, reject) => {
    const id = `field-module-${name}`;
    const prev = document.getElementById(id);
    if (prev !== null) { prev.remove(); }
    const script = document.createElement('script');
    script.id = id;
    script.src = `${getHost()}/${uri}`;
    script.type = 'module';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

const FM_ENDPOINT = process.env.NODE_ENV === 'development'
  ? 'api/client_module/client_module' : 'api/field_module/field_module';
const FM_DIR = process.env.NODE_ENV === 'development'
  ? 'farm/client/js/' : 'fieldkit/js/';
const FM_FILE = '/index.js';
const transformModuleData = (data) => {
  const { id, attributes } = data;
  const {
    drupal_internal__id: name, status, label, description,
  } = attributes;
  const uri = FM_DIR + name + FM_FILE;
  return ({
    id, name, uri, status, label, description,
  });
};
const transformModuleResponse = compose(
  map(transformModuleData),
  path(['data', 'data']),
);
export const fetchFieldModules = () => farm.remote.request(FM_ENDPOINT)
  .then(transformModuleResponse);
