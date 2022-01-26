import { createRouter, createWebHistory } from 'vue-router';
import Login from './login/Login.vue';
import LoginMenuBar from './login/LoginMenuBar.vue';
import Logout from './login/Logout.vue';
import LogoutMenuBar from './login/LogoutMenuBar.vue';
import Home from './home/Home.vue';
import HomeMenuBar from './home/HomeMenuBar.vue';

const router = createRouter({
  history: createWebHistory(),
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
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
});

export default router;
