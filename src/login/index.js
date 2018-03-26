import Login from './Login.vue';
import loginModule from './loginModule';
import mixinLogic from './mixin.js';
// adding in VueCordova plugin
import VueCordova from 'vue-cordova';

export default {
  install( Vue, { router, store }) {
    const LoginComponent = Vue.component(Login.name, Login)
    router.addRoutes([{
      path: '/login',
      name: 'Login',
      component: LoginComponent
    }]);
    store.registerModule('user', loginModule);
    Vue.mixin(mixinLogic)
    // adding in VueCordova plugin
    Vue.use(VueCordova)
  }
};
