import Vue from 'vue'
import Router from 'vue-router'
import Calendar from '../components/Calendar'
import Observations from '../components/Observations'
import NewObservation from '../components/NewObservation'
import DataNative from '../components/DataNative'

Vue.use(Router)

export default new Router({
  routes: [

    {
      path: '/',
      name: 'Calendar',
      component: Calendar
    },
    {
      path: '/',
      name: 'Observations',
      component: Observations
    },
    {
      path: '/',
      name: 'NewObservation',
      component: NewObservation
    },
    {
      path: '/',
      name: 'DataNative',
      component: DataNative
    }

  ]
})
