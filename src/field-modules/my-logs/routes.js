import Logs from './components/Logs';
import AllLogs from './components/AllLogs';
import AllLogsMenuBar from './components/AllLogsMenuBar';
import EditLog from './components/EditLog';
import EditLogMenuBar from './components/EditLogMenuBar';
import EditMap from './components/EditMap';
import EditMapMenuBar from './components/EditMapMenuBar';
import FilterLogs from './components/FilterLogs';
import FilterLogsMenuBar from './components/FilterLogsMenuBar';

const routes = [
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
];

export default routes;
