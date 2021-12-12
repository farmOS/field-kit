import Tasks from './components/Tasks';
import TasksAll from './components/TasksAll';
import TasksAllMenuBar from './components/TasksAllMenuBar';
import TasksEdit from './components/TasksEdit';
import TasksEditMenuBar from './components/TasksEditMenuBar';
import TasksMap from './components/TasksMap';
import TasksMapMenuBar from './components/TasksMapMenuBar';
import TasksFilter from './components/TasksFilter';
import TasksFilterMenuBar from './components/TasksFilterMenuBar';

const routes = [
  {
    path: '/tasks',
    component: Tasks,
    children: [
      {
        path: '',
        name: 'tasks-all',
        components: {
          default: TasksAll,
          menubar: TasksAllMenuBar,
        },
      },
      {
        path: ':id',
        name: 'tasks-edit',
        components: {
          default: TasksEdit,
          menubar: TasksEditMenuBar,
        },
        props: { default: true, menubar: true },
      },
      {
        path: ':id/map',
        name: 'tasks-map',
        components: {
          default: TasksMap,
          menubar: TasksMapMenuBar,
        },
        props: { default: true, menubar: true },
      },
      {
        path: 'filter',
        name: 'tasks-filter',
        components: {
          default: TasksFilter,
          menubar: TasksFilterMenuBar,
        },
      },
    ],
  },
];

export default routes;
