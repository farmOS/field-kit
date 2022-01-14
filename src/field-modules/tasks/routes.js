import Tasks from './components/Tasks.vue';
import TasksAll from './components/TasksAll.vue';
import TasksAllMenuBar from './components/TasksAllMenuBar.vue';
import TasksEdit from './components/TasksEdit.vue';
import TasksEditMenuBar from './components/TasksEditMenuBar.vue';
import TasksMap from './components/TasksMap.vue';
import TasksMapMenuBar from './components/TasksMapMenuBar.vue';
import TasksFilter from './components/TasksFilter.vue';
import TasksFilterMenuBar from './components/TasksFilterMenuBar.vue';

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
