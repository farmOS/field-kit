import Vue from 'vue';
import Router from 'vue-router';
import Observations from '../components/Observations';
import EditObservation from '../components/EditObservation';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/edit-observation',
    },
    {
      path: '/observations',
      name: 'Observations',
      component: Observations,
    },
    {
      path: '/edit-observation',
      name: 'EditObservation',
      component: EditObservation,
    },

  ],
});
