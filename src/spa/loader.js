// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import router from './router';
import store from './store';
import App from './App';

Vue.config.productionTip = false;

export default (data, login) => {
  // TODO: Error handling for required args, better control flow for optional args
  Vue.use(data, {store, router})
  if (typeof login !== 'undefined') {
    Vue.use(login, {router, store})
  }
  return new Vue({
    el: '#app',
    store,
    router,
    components: {App},
    template: '<App/>'
  })
};
