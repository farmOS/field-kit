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
      done: false,
    },
  },
  routes,
};
