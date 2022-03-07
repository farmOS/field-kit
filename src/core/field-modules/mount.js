import {
  assoc, compose, concat, curry, evolve, map, mapObjIndexed,
  mergeDeepWith, pick, prop,
} from 'ramda';
import { kebab } from 'field-kit-utils/string-case';
import routeMixin from '../mixins/routeMixin';
import widgetMixin from '../mixins/widgetMixin';
import { upsertModuleConfig } from './index';

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
const mountFieldModule = deps => (mod) => {
  const { app, router } = deps;
  const { routes = [], widget } = mod;
  const modConfig = parseModuleConfig(mod, app);
  upsertModuleConfig(modConfig);
  if (widget) registerWidget(app, mod.name, widget);
  routes.forEach((raw) => {
    const route = prepRoute(raw);
    router.addRoute(route);
  });
};

export default mountFieldModule;
