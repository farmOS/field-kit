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
    store.registerModule('auth', loginModule);
  },
};
