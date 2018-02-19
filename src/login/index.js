import LoginComponent from './LoginComponent.vue';

const LoginPlugin = {
  install(Vue, options) {
    Vue.component(LoginComponent.name, LoginComponent)
  }
};

export default LoginPlugin;
