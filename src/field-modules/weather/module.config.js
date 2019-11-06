import Weather from './components/Weather';
import WeatherMenuBar from './components/WeatherMenuBar';
import DrawerItems from './components/DrawerItems';

export default {
  name: 'weather-form',
  drawer: DrawerItems,
  routes: [
    {
      name: 'weather-form',
      path: '/weather',
      components: {
        default: Weather,
        menubar: WeatherMenuBar,
      },
    },
  ],
};
