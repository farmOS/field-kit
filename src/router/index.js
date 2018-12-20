import Vue from 'vue';
import Router from 'vue-router';
import Logs from '../components/Logs';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/logs',
    },
    {
      path: '/logs',
      name: 'Logs',
      component: Logs,
    },
  ],
});
