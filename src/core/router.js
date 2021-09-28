import Vue from 'vue';
import Router from 'vue-router';
import Login from './login/Login';
import LoginMenuBar from './login/LoginMenuBar';
import Logout from './login/Logout';
import LogoutMenuBar from './login/LogoutMenuBar';
import Home from './home/Home';
import HomeMenuBar from './home/HomeMenuBar';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
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

export default router;
