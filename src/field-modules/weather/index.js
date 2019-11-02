import modConfig from './module.config';
import Weather from './components/Weather';
import WeatherMenuBar from './components/WeatherMenuBar';
import DrawerItems from './components/DrawerItems';

export default {
  install(Vue, { store, router }) {
    store.commit('updateModule', modConfig);
    const WeatherComponent = Vue.component(Weather.name, Weather);
    const WeatherMenuBarComponent = Vue.component(WeatherMenuBar.name, WeatherMenuBar);
    Vue.component(DrawerItems.name, DrawerItems);
    router.addRoutes([
      {
        name: 'weather-form',
        path: '/weather',
        components: {
          default: WeatherComponent,
          menubar: WeatherMenuBarComponent,
        },
      },
    ]);
  },
};
