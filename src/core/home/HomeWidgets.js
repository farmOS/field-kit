// Pass the children of a component VNode as the default slot of an object. See:
// https://v3.vuejs.org/guide/render-function.html#slots
const slotsDefault = slots => ({
  default(props) {
    return typeof slots === 'function' ? slots(props) : slots;
  },
});

const HomeWidgets = {
  name: 'home-widgets',
  props: ['modules'],
  render() {
    const { h, resolveComponent } = window.Vue;
    const { component } = window.app;
    const self = this;
    return h(
      resolveComponent('farm-tiles'),
      {
        columns: [1, 2, 3],
        breakpoints: [0, 600, 900],
        space: 's',
      },
      slotsDefault(this.modules.map((mod) => {
        const WidgetComponent = component(mod.widget);
        return h(
          resolveComponent('farm-card'),
          {
            onClick() {
              self.$router.push(mod.routes[0].path);
            },
          },
          slotsDefault(() => ([
            h('h3', this.$t(mod.label)),
            h(
              WidgetComponent,
              {
                onClick() {
                  self.$router.push(mod.routes[0].path);
                },
              },
            ),
          ])),
        );
      })),
    );
  },
};

export default HomeWidgets;
