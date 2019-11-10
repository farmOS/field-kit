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

// Recusive function for running async upgrades sequentially.
export const runUpgrades = deps => (upgrades) => {
  if (upgrades.length > 0) {
    const tail = upgrades.slice(1);
    // Wrap every onUpgrade call so we can be sure it returns a promise.
    return Promise.resolve(upgrades[0].onUpgrade(deps))
      .then(() => runUpgrades(deps)(tail));
  }
  return undefined;
};

// Recursive function for sorting and inserting the next upgrade into an array
// of upgrades, sorted in ascending order by version #.
export const sortByVersion = (arr, next) => {
  if (!next) { return arr; }
  const last = arr[arr.length - 1];
  const rest = arr.slice(0, arr.length - 1);
  if (arr.length < 1 || next.version > last.version) {
    return arr.concat(next);
  }
  return sortByVersion(rest, next).concat(last);
};

// Function that takes a minimum version # and returns a reducer function for
// filtering by that minimum and sorting in ascending order.
export const filterAndSort = (min = 0) => (acc, cur) => {
  if (cur.version > min) {
    return sortByVersion(acc, cur);
  }
  return acc;
};

// Factory function that returns an object which complies with the Vue plugin
// spec: https://vuejs.org/v2/guide/plugins.html#Writing-a-Plugin.
const createFieldModule = modConfig => ({
  install(Vue, { store, router }) {
    const {
      drawer,
      filters,
      name,
      routes,
      upgrades,
    } = modConfig;
    const currentVersion = store.state.shell.modules
      .find(mod => mod.name === name).version;
    const requiredUpgrades = upgrades.reduce(filterAndSort(currentVersion), []);
    runUpgrades({ store, router })(requiredUpgrades);
    store.commit('updateModule', { name, filters });
    Vue.component(
      `${name}-drawer-items`,
      { ...drawer, name: `${name}-drawer-items` },
    );
    router.addRoutes(createRoutes(Vue, name, routes));
  },
});

export default createFieldModule;
