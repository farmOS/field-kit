import modConfig from './module.config';
import createRoutes from '@/utils/createRoutes';
import Weather from './components/Weather';
import WeatherMenuBar from './components/WeatherMenuBar';
import DrawerItems from './components/DrawerItems';

export default {
  install(Vue, { store, router }) {
    store.commit('updateModule', modConfig);
    Vue.component(DrawerItems.name, DrawerItems);
    router.addRoutes(createRoutes(Vue, modConfig, [
      {
        name: 'weather-form',
        path: '/weather',
        components: {
          default: Weather,
          menubar: WeatherMenuBar,
        },
      },
    ]));
  },
};
