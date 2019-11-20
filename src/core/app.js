import Vue from 'vue';
import router from './router';
import store from './store';
import App from './App.vue'; // eslint-disable-line import/extensions
import './bootstrap-simplex.min.css';
import './vars.css';

Vue.config.productionTip = false;

export default (el, plugins) => {
  // Load build-time plugins
  if (plugins !== undefined && plugins.length > 0) {
    plugins.forEach(p => Vue.use(p, { store, router }));
  }
  return new Vue({
    el,
    store,
    router,
    components: { App },
    template: '<App/>',
  });
};
