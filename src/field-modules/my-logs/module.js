import routes from './routes';
import MyLogsWidget from './components/MyLogsWidget';

export default {
  name: 'my-logs',
  label: 'My Logs',
  widget: MyLogsWidget,
  filters: {
    log: {
      log_owner: 'SELF',
      done: false,
    },
  },
  routes,
};
