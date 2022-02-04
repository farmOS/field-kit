import Tasks from './components/Tasks.vue';
import TasksAll from './components/TasksAll.vue';
import TasksEdit from './components/TasksEdit.vue';
import TasksMap from './components/TasksMap.vue';
import TasksFilter from './components/TasksFilter.vue';

const routes = [
  {
    path: '/tasks',
    component: Tasks,
    children: [
      {
        path: '',
        name: 'tasks-all',
        component: TasksAll,
      },
      {
        path: ':id',
        name: 'tasks-edit',
        component: TasksEdit,
        props: true,
      },
      {
        path: ':id/map',
        name: 'tasks-map',
        component: TasksMap,
        props: true,
      },
      {
        path: 'filter',
        name: 'tasks-filter',
        component: TasksFilter,
      },
    ],
  },
];

export default routes;
