import Vue from 'vue';
import Router from 'vue-router';
import Logs from '../components/Logs';
import AllLogs from '../components/AllLogs';
import AllLogsMenuBar from '../components/AllLogsMenuBar';
import EditLogMenuBar from '../components/EditLogMenuBar';
import EditLog from '../components/EditLog';
import FilterLogsMenuBar from '../components/FilterLogsMenuBar';
import FilterLogs from '../components/FilterLogs';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/logs',
    },
    {
      path: '/logs',
      component: Logs,
      children: [
        {
          path: '',
          name: 'logs',
          components: {
            default: AllLogs,
            menubar: AllLogsMenuBar,
          },
        },
        {
          // Bringing params into the path (:type) allows them to be set as props
          path: 'edit/:type',
          name: 'edit-log',
          components: {
            default: EditLog,
            menubar: EditLogMenuBar,
          },
          props: { default: true, menubar: true },
        },
        {
          path: 'filter',
          name: 'filter-logs',
          components: {
            default: FilterLogs,
            menubar: FilterLogsMenuBar,
          },
        },
      ],
    },
  ],
});
