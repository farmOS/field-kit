import Weather from './components/Weather';
import WeatherMenuBar from './components/WeatherMenuBar';
import DrawerItems from './components/DrawerItems';
import Widget from './components/Widget';

export default {
  name: 'weather-form',
  drawer: DrawerItems,
  widget: Widget,
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
