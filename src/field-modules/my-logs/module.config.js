import routes from './routes';
import Widget from './components/Widget';

export default {
  name: 'my-logs',
  label: 'My Logs',
  widget: Widget,
  filters: {
    log: {
      log_owner: 'SELF',
      done: false,
    },
  },
  routes,
};
