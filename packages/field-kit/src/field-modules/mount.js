import {
  assoc, compose, curry, evolve, map, mapObjIndexed, pick, prop,
} from 'ramda';
import { kebab } from '../../namespaces';
import { upsertModuleConfig } from './index';

const parseWidgetName = curry((modName, widget) =>
  (widget?.name ? kebab(widget.name) : `${kebab(modName)}-widget`));

const registerWidget = (app, modName, widget) => {
  app.component(
    parseWidgetName(modName, widget),
    widget,
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

// Functions for parsing module config objects as serializable data.
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
);
const prepRoute = route => evolve({
  component: prepComponent(route),
  components: mapObjIndexed(prepComponent(route)),
  children: map(prepRoute),
}, route);

// Main function called by modules to register their components and routes to
// the main Vue instance.
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
