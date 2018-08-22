import Login from './Login.vue'; // eslint-disable-line import/extensions
import loginModule from './loginModule';
import mixinLogic from './mixin';

export default {
  install(Vue, { router, store }) {
    const LoginComponent = Vue.component(Login.name, Login);
    router.addRoutes([{
      path: '/login',
      name: 'Login',
      component: LoginComponent,
    }]);
    store.registerModule('user', loginModule);
    Vue.mixin(mixinLogic);
  },
};
