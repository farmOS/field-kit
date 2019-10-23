import Vue from 'vue';
import Router from 'vue-router';
import Logs from '../components/Logs';
import AllLogs from '../components/AllLogs';
import AllLogsMenuBar from '../components/AllLogsMenuBar';
import EditLogMenuBar from '../components/EditLogMenuBar';
import EditLog from '../components/EditLog';
import EditMapMenuBar from '../components/EditMapMenuBar';
import EditMap from '../components/EditMap';
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
          path: ':id',
          name: 'edit-log',
          components: {
            default: EditLog,
            menubar: EditLogMenuBar,
          },
          props: { default: true, menubar: true },
        },
        {
          path: ':id/map',
          name: 'edit-map',
          components: {
            default: EditMap,
            menubar: EditMapMenuBar,
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
