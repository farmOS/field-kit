import Login from './Login.vue'; // eslint-disable-line import/extensions
import Logout from './Logout.vue'; // eslint-disable-line import/extensions
import loginModule from './loginModule';

export default {
  install(Vue, { router, store }) {
    const LoginComponent = Vue.component(Login.name, Login);
    const LogoutComponent = Vue.component(Logout.name, Logout);
    router.addRoutes([
      {
        path: '/login',
        name: 'Login',
        component: LoginComponent,
      },
      {
        path: '/logout',
        name: 'Logout',
        component: LogoutComponent,
      },
    ]);
    router.beforeEach((to, from, next) => {
      // If user logged out then logged back in, don't route them back to logout,
      // but send them to root instead.
      if (from.path === '/login' && to.path === '/logout') {
        next('/');
      }
      next();
    });
    store.registerModule('auth', loginModule);
  },
};
