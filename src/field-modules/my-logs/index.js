import modConfig from './module.config';
import Logs from './components/Logs';
import AllLogs from './components/AllLogs';
import AllLogsMenuBar from './components/AllLogsMenuBar';
import EditLog from './components/EditLog';
import EditLogMenuBar from './components/EditLogMenuBar';
import EditMap from './components/EditMap';
import EditMapMenuBar from './components/EditMapMenuBar';
import FilterLogs from './components/FilterLogs';
import FilterLogsMenuBar from './components/FilterLogsMenuBar';
import DrawerItems from './components/DrawerItems';

export default {
  install(Vue, { router, store }) {
    store.commit('updateModule', modConfig);
    const LogsComponent = Vue.component(Logs.name, Logs);
    const AllLogsComponent = Vue.component(AllLogs.name, AllLogs);
    const AllLogsMenuBarComponent = Vue.component(AllLogsMenuBar.name, AllLogsMenuBar);
    const EditLogComponent = Vue.component(EditLog.name, EditLog);
    const EditLogMenuBarComponent = Vue.component(EditLogMenuBar.name, EditLogMenuBar);
    const EditMapComponent = Vue.component(EditMap.name, EditMap);
    const EditMapMenuBarComponent = Vue.component(EditMapMenuBar.name, EditMapMenuBar);
    const FilterLogsComponent = Vue.component(FilterLogs.name, FilterLogs);
    const FilterLogsMenuBarComponent = Vue.component(FilterLogsMenuBar.name, FilterLogsMenuBar);
    Vue.component(DrawerItems.name, DrawerItems);
    router.addRoutes([
      {
        path: '/logs',
        component: LogsComponent,
        children: [
          {
            path: '',
            name: 'logs',
            components: {
              default: AllLogsComponent,
              menubar: AllLogsMenuBarComponent,
            },
          },
          {
            path: ':id',
            name: 'edit-log',
            components: {
              default: EditLogComponent,
              menubar: EditLogMenuBarComponent,
            },
            props: { default: true, menubar: true },
          },
          {
            path: ':id/map',
            name: 'edit-map',
            components: {
              default: EditMapComponent,
              menubar: EditMapMenuBarComponent,
            },
            props: { default: true, menubar: true },
          },
          {
            path: 'filter',
            name: 'filter-logs',
            components: {
              default: FilterLogsComponent,
              menubar: FilterLogsMenuBarComponent,
            },
          },
        ],
      },
    ]);
  },
};
