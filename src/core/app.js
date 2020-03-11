import Vue from 'vue';
import router from './router';
import store from './store';
import App from './App.vue'; // eslint-disable-line import/extensions
import './bootstrap-simplex.min.css';
import './vars.css';
import manifest from '../field-modules/test-plugin/manifest.json';
import utils from '../utils';

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
