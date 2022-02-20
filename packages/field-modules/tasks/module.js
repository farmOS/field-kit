import routes from './routes';
import TasksWidget from './components/TasksWidget.vue';

export default {
  name: 'tasks',
  label: 'Tasks',
  widget: TasksWidget,
  routes,
};
