import {
  assoc, compose, concat, curry, evolve, map, mapObjIndexed,
  mergeDeepWith, path, pick, prop,
} from 'ramda';
import { getHost } from './remote';
import farm from './farm';
import routeMixin from './mixins/routeMixin';
import widgetMixin from './mixins/widgetMixin';

// Convert PascalCase & camelCase to kebab-case (or snake_case), based on:
// https://stackoverflow.com/a/67243723/1549703.
const pascalRegex = /[A-Z]+(?![a-z])|[A-Z]/g;
const kebabReplacer = (match, offset) =>
  (offset ? '-' : '') + match.toLowerCase();
const kebab = str => str.replace(pascalRegex, kebabReplacer).replaceAll('_', '-');
const snakeReplacer = (match, offset) =>
  (offset ? '_' : '') + match.toLowerCase();
const snake = str => str.replace(pascalRegex, snakeReplacer).replaceAll('-', '_');

const parseWidgetName = curry((modName, widget) =>
  (widget?.name ? kebab(widget.name) : `${kebab(modName)}-widget`));

// Returns a function that takes a component and adds a mixin too it.
const withMixin = mixin => mergeDeepWith(concat, { mixins: [mixin] });

// Functions for registering widget and main route components globally on the
// application instance and adding the routeMixin to each.
const addWidgetMixin = withMixin(widgetMixin);
const registerWidget = (app, modName, widget) => {
  app.component(
    parseWidgetName(modName, widget),
    addWidgetMixin(widget),
  );
};

// Guarantee that all route components have a consistent, valid name.
const nameFromPath = str => [...str.matchAll(/[a-z|A-Z]*/g)].join('-').toLowerCase();
const fallbackName = (route, viewName) => {
  const suffix = viewName ? `-${viewName}` : '';
  const name = route.name || nameFromPath(route.path);
  return `${name}${suffix}`;
};
const normalizeComponentName = route => (component, viewName) => {
  if (component.name) return component;
  return assoc('name', fallbackName(route.name, viewName), component);
};

// Functions for parsing module config objects as primitive data that can be
// serialized, stored and tracked in Vuex.
const parseComponentName = compose(kebab, prop('name'));
const parseRoute = route => compose(
  evolve({
    component: parseComponentName,
    components: map(parseComponentName),
    children: map(parseRoute),
  }),
  evolve({
    component: normalizeComponentName(route),
    components: mapObjIndexed(normalizeComponentName(route)),
  }),
  pick(['name', 'path', 'component', 'components', 'children', 'alias']),
)(route);
const parseModuleConfig = mod => evolve({
  routes: map(parseRoute),
  widget: parseWidgetName(mod.name),
}, mod);

// Prepare route components prior to registering them with Vue Router.
const prepComponent = route => compose(
  normalizeComponentName(route),
  withMixin(routeMixin),
);
const prepRoute = route => evolve({
  component: prepComponent(route),
  components: mapObjIndexed(prepComponent(route)),
  children: map(prepRoute),
}, route);

// Main function called by modules to add their components and routes to the
// main Vue app and Vuex store.
export const mountFieldModule = deps => (mod) => {
  const { app, router, store } = deps;
  const { routes = [], widget } = mod;
  const modConfig = parseModuleConfig(mod, app);
  store.commit('updateModuleConfig', modConfig);
  if (widget) registerWidget(app, mod.name, widget);
  routes.forEach((raw) => {
    const route = prepRoute(raw);
    router.addRoute(route);
  });
};

// Field Module constants, which should be moved to shared library where they
// can be accessed by both field-kit and field-scripts.
const FM_ENDPOINT = '/api/field_module/field_module';
const FM_DIR = 'fieldkit/js';
const FM_FILE = 'index.js';
const resolveModulePathname = name => `${FM_DIR}/${snake(name)}/${FM_FILE}`;

// Takes module info from the API and uses it to inject a script tag and run
// a module's main entry file (eg, module.js).
export const loadFieldModule = ({ name }) => new Promise((resolve, reject) => {
  const id = `field-module-${name}`;
  const prev = document.getElementById(id);
  if (prev !== null) { prev.remove(); }
  const script = document.createElement('script');
  script.id = id;
  script.src = `${getHost()}/${resolveModulePathname(name)}`;
  script.type = 'module';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.onload = resolve;
  script.onerror = reject;
  document.body.appendChild(script);
});

const transformModuleData = (data) => {
  const { id, attributes } = data;
  const {
    drupal_internal__id, status, label, description,
  } = attributes;
  const name = kebab(drupal_internal__id);
  return ({
    id, name, status, label, description,
  });
};
const transformModuleResponse = compose(
  map(transformModuleData),
  path(['data', 'data']),
);

export const fetchFieldModules = () => farm.remote.request(FM_ENDPOINT)
  .then(transformModuleResponse);
