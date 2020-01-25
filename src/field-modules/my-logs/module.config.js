import routes from './routes';
import DrawerItems from './components/DrawerItems';
import Widget from './components/Widget';

export default {
  name: 'my-logs',
  drawer: DrawerItems,
  widget: Widget,
  filters: {
    log: {
      log_owner: 'SELF',
      type: ['farm_activity', 'farm_observation', 'farm_harvest', 'farm_input', 'farm_seeding'],
      done: false,
    },
  },
  routes,
};
