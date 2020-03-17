import Vue from 'vue';
import router from './router';
import store from './store';
import App from './App.vue'; // eslint-disable-line import/extensions
import './bootstrap-simplex.min.css';
import './vars.css';
import utils from '../utils';
import components from '../components';

Vue.config.productionTip = false;

// Mock the farmOS.js library for now
const fakeFarm = {
  info() {
    return Promise.resolve({
      client: {
        modules: [manifest],
      },
    });
  },
};

// Attach utils to the global namespace so Field Modules can access them.
if (window.farmOS === undefined) {
  window.farmOS = {};
}
window.farmOS.utils = utils;

// Register the shared component library globally so they can be accessed from
// any other component on the root Vue instance.
components.forEach((c) => { Vue.component(c.name, c); });

export default (el, plugins) => {
  // Load build-time plugins
  if (plugins !== undefined && plugins.length > 0) {
    plugins.forEach(p => Vue.use(p, { store, router }));
  }
  // Fetch and load field modules at runtime
  fakeFarm.info()
    .then(res => res.client.modules.forEach((module) => {
      const script = document.createElement('script');
      script.src = module.index;
      script.id = `field-module-${module.name}`;
      script.type = 'module';
      script.async = true;
      script.onload = () => Vue.use(
        { install: window[`install${module.name}`] },
        { store, router },
      );
      script.onerror = () => console.error(`Error installing ${module.name} module`);
      document.body.appendChild(script);
    }));
  return new Vue({
    el,
    store,
    router,
    components: { App },
    template: '<App/>',
  });
};
