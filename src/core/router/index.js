import Vue from 'vue';
import Router from 'vue-router';
import Login from '../login/Login';
import Logout from '../login/Logout';
import Home from '../home/Home';
import HomeMenuBar from '../home/HomeMenuBar';

Vue.use(Router);

const router = new Router({
  routes: [
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
      path: '/home',
      name: 'Home',
      components: {
        default: Home,
        menubar: HomeMenuBar,
      },
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
