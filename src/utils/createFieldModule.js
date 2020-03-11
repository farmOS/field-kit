// A recursive function for initializing a field module's route components and
// child components, as well as adding the proper module meta tags.
const createRoutes = (Vue, modName, routes) => (
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
    children: createRoutes(Vue, modName, children),
    meta: { ...meta, module: modName },
    params,
    props,
    query,
  }))
);

// Factory function that returns an object which complies with the Vue plugin
// spec: https://vuejs.org/v2/guide/plugins.html#Writing-a-Plugin.
const createFieldModule = modConfig => ({
  install(Vue, { store, router }) {
    const {
      drawer,
      widget,
      filters,
      name,
      routes,
    } = modConfig;
    store.commit('updateModule', { name, filters });
    Vue.component(
      `${name}-drawer-items`,
      { ...drawer, name: `${name}-drawer-items` },
    );
    Vue.component(
      `${name}-widget`,
      { ...widget, name: `${name}-widget` },
    );
    router.addRoutes(createRoutes(Vue, name, routes));
  },
});

export default createFieldModule;
