// A recursive function for initializing a field module's route components and
// child components, as well as adding the proper module meta tags.
const createRoutes = (Vue, modName, routes, store) => (
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
    beforeEnter(to, from, next) {
      if (store && store.state.shell.currentModule !== modName) {
        store.commit('setCurrentModule', modName);
        store.commit('filterLogs', log => log.modules.includes(modName));
        store.dispatch('loadCachedLogs');
      }
      next();
    },
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
      label,
    } = modConfig;
    store.commit('updateModule', {
      name,
      label,
      filters,
      routes: routes.map(r => ({ name: r.name, path: r.path })),
    });
    Vue.component(
      `${name}-drawer-items`,
      { ...drawer, name: `${name}-drawer-items` },
    );
    Vue.component(
      `${name}-widget`,
      { ...widget, name: `${name}-widget` },
    );
    router.addRoutes(createRoutes(Vue, name, routes, store));
  },
});

export default createFieldModule;
