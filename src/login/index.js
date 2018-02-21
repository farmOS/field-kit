import Login from './Login.vue';
import loginModule from './store';

export default {
  install( vue, { router, store }) {
    const LoginComponent = vue.component(Login.name, Login)
    router.addRoutes([{
      path: '/login',
      name: 'Login',
      component: LoginComponent
    }]);
    store.registerModule('user', loginModule);
  }
};
