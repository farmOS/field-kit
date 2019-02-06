import Vue from 'vue';
import Router from 'vue-router';
import Logs from '../components/Logs';
import AllLogs from '../components/AllLogs';
import EditLog from '../components/EditLog';

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
          component: AllLogs,
        },
        {
          // Bringing params into the path (:type) allows them to be set as props
          path: 'edit/:type',
          name: 'edit-log',
          component: EditLog,
          props: true,
        },
      ],
    },
  ],
});
