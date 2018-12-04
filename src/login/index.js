import Login from './Login.vue'; // eslint-disable-line import/extensions
import loginModule from './loginModule';

export default {
  install(Vue, { router, store }) {
    const LoginComponent = Vue.component(Login.name, Login);
    router.addRoutes([{
      path: '/login',
      name: 'Login',
      component: LoginComponent,
    }]);
    store.registerModule('user', loginModule);
    // Add a navigation guard to check if user is logged in.
    router.beforeEach((to, from, next) => {
      const isLoggedIn = store.state.user.isLoggedIn
        || window.localStorage.getItem('token');
      if (!isLoggedIn && to.path !== '/login') {
        next('/login');
      }
      next();
    });
  },
};
