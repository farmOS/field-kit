// A recursive function for initializing a field module's route components and
// child components, as well as adding the proper module meta tags.
const createRoutes = (Vue, modConfig, routes) => (
  !Array.isArray(routes) ? undefined : routes.map(({
    path,
    name,
    component,
    components,
    children,
    meta,
    params,
    props,
    query,
  }) => ({
    path,
    name,
    component: typeof component !== 'object'
      ? undefined
      : Vue.component(component.name, component),
    components: typeof components !== 'object'
      ? undefined
      : Object.entries(components).reduce((acc, [key, val]) => ({
        ...acc,
        [key]: Vue.component(val.name, val),
      }), {}),
    children: createRoutes(Vue, modConfig, children),
    meta: { ...meta, module: modConfig.name },
    params,
    props,
    query,
  }))
);

export default createRoutes;
