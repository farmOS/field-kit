import Vue from 'vue';
import Router from 'vue-router';
import Login from '../login/Login';
import LoginMenuBar from '../login/LoginMenuBar';
import Logout from '../login/Logout';
import LogoutMenuBar from '../login/LogoutMenuBar';
import Home from '../home/Home';
import HomeMenuBar from '../home/HomeMenuBar';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      components: {
        default: Login,
        menubar: LoginMenuBar,
      },
    },
    {
      path: '/logout',
      name: 'Logout',
      components: {
        default: Logout,
        menubar: LogoutMenuBar,
      },
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
