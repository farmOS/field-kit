import Vue from 'vue';
import Router from 'vue-router';
import Login from './login/Login.vue';
import LoginMenuBar from './login/LoginMenuBar.vue';
import Logout from './login/Logout.vue';
import LogoutMenuBar from './login/LogoutMenuBar.vue';
import Home from './home/Home.vue';
import HomeMenuBar from './home/HomeMenuBar.vue';

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
