import Vue from 'vue';
import Router from 'vue-router';
import Calendar from '../components/Calendar';
import Observations from '../components/Observations';
import NewObservation from '../components/NewObservation';
import DataNative from '../components/DataNative';
import TestStateData from '../components/TestStateData'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/new-observation'
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: Calendar
    },
    {
      path: '/observations',
      name: 'Observations',
      component: Observations
    },
    {
      path: '/new-observation',
      name: 'NewObservation',
      component: NewObservation
    },
    {
      path: '/data-native',
      name: 'DataNative',
      component: DataNative
    },
    {
      path: '/test-state-data',
      name: 'TestStateData',
      component: TestStateData
    }
    
  ]
})
