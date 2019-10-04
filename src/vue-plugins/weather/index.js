import Weather from './components/Weather';
import WeatherMenuBar from './components/WeatherMenuBar';

export default {
  install(Vue, { router }) {
    const WeatherComponent = Vue.component(Weather.name, Weather);
    const WeatherMenuBarComponent = Vue.component(WeatherMenuBar.name, WeatherMenuBar);
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
