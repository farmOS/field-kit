import Vue from 'vue';
import Router from 'vue-router';
import Login from '../login/Login';
import Logout from '../login/Logout';
import Homescreen from '../homescreen/Homescreen';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/logs',
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/logout',
      name: 'Logout',
      component: Logout,
    },
    {
      path: '/homescreen',
      name: 'Homescreen',
      component: Homescreen
      ,
    },
  ],
});

router.beforeEach((to, from, next) => {
  // If user logged out then logged back in, don't route them back to logout,
  // but send them to root instead.
  if (from.path === '/login' && to.path === '/logout') {
    next('/');
  }
  next();
});

export default router;
