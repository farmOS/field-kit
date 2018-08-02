import Vue from 'vue';
import Router from 'vue-router';
import Observations from '../components/Observations';
import EditObservation from '../components/EditObservation';
import AllObservations from '../components/AllObservations';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/observations',
    },
    {
      path: '/observations',
      name: 'Observations',
      component: Observations,
    },
  ],
});
