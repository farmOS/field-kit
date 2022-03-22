const HomeWidgets = {
  name: 'home-widgets',
  props: ['modules'],
  setup({ modules }) {
    const { h, resolveComponent } = window.Vue;
    const { useRouter } = window.VueRouter;
    const { component } = window.app;
    const { useEntities } = window.lib;
    const router = useRouter();
    return () => h(
      resolveComponent('farm-tiles'),
      {
        columns: [1, 2, 3],
        breakpoints: [0, 600, 900],
        space: 's',
      },
      {
        default() {
          return modules.map((mod) => {
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
        },
      },
    );
  },
};

export default HomeWidgets;
