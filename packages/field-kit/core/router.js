import { createRouter, createWebHistory } from 'vue-router';
import Login from './login/Login.vue';
import Logout from './login/Logout.vue';
import Home from './home/Home.vue';

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
      component: Home,
    },
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
});

export default router;
