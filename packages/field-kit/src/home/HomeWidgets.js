import { is } from 'ramda';

const noModsInfoText = 'It looks like you don\'t have any Field Modules installed, '
  + 'or they have failed to load. Contact your farmOS server administrator to '
  + 'install new modules, or troubleshoot why they are not loading.';

const HomeWidgets = {
  name: 'home-widgets',
  props: ['modules'],
  setup({ modules: allModules }) {
    const { h, resolveComponent } = window.Vue;
    const { useRouter } = window.VueRouter;
    const { component } = window.app;
    const { useEntities } = window.lib;
    const router = useRouter();
    const widgetModules = allModules.filter(mod => is(Object, mod));
    const noModulesCard = h(
      resolveComponent('farm-card'),
      { space: 's' },
      {
        default: () => h(
          resolveComponent('farm-stack'),
          { space: 's' },
          {
            default: () => [
              h('h3', null, { default: () => 'Welcome to Field Kit!' }),
              h(
                resolveComponent('farm-text'),
                { size: 's' },
                { default: () => noModsInfoText },
              ),
            ],
          },
        ),
      },
    );
    const moduleCards = widgetModules.map((mod) => {
      const WidgetComponent = component(mod.widget);
      const onClick = () => { router.push(mod.routes[0].path); };
      const {
        append, checkout, commit, revise,
      } = useEntities({ module: mod });
      return h(
        resolveComponent('farm-card'),
        { onClick },
        {
          default() {
            return [
              h('h3', mod.label),
              h(
                WidgetComponent,
                {
                  append, checkout, commit, revise, onClick,
                },
              ),
            ];
          },
        },
      );
    });
    return () => h(
      resolveComponent('farm-tiles'),
      {
        columns: [1, 2, 3],
        breakpoints: [0, 600, 900],
        space: 's',
      },
      {
        default() {
          if (!Array.isArray(widgetModules) || widgetModules.length < 1) {
            return [noModulesCard];
          }
          return moduleCards;
        },
      },
    );
  },
};

export default HomeWidgets;
