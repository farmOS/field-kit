import routes from './routes';
import DrawerItems from './components/DrawerItems';

export default {
  name: 'my-logs',
  drawer: DrawerItems,
  filters: {
    log: {
      log_owner: 'SELF',
      done: false,
    },
  },
  routes,
};
