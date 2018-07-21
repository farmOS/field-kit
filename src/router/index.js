import Vue from 'vue';
import Router from 'vue-router';
import Calendar from '../components/Calendar';
import Observations from '../components/Observations';
import EditObservation from '../components/EditObservation';
import DataNative from '../components/DataNative';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/edit-observation',
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: Calendar,
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
    {
      path: '/data-native',
      name: 'DataNative',
      component: DataNative,
    },

  ],
});
