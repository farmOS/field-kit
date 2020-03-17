import Vue from 'vue';
import farmConnect from 'farmos';
import router from './router';
import store from './store';
import App from './App.vue'; // eslint-disable-line import/extensions
import './bootstrap-simplex.min.css';
import './vars.css';
import utils from '../utils';
import components from '../components';

Vue.config.productionTip = false;

// Attach utils to the global namespace so Field Modules can access them.
if (window.farmOS === undefined) {
  window.farmOS = {};
}
window.farmOS.utils = utils;

// Provide a global namespace to which modules can attach their config.
if (window.farmOS.modules === undefined) {
  window.farmOS.modules = {};
}

// Register the shared component library globally so they can be accessed from
// any other component on the root Vue instance.
components.forEach((c) => { Vue.component(c.name, c); });

export default (el, plugins) => {
  // Load build-time plugins
  if (plugins !== undefined && plugins.length > 0) {
    plugins.forEach(p => Vue.use(p, { store, router }));
  }

  // Fetch and load field modules at runtime
  const farm = farmConnect(
    localStorage.getItem('host'),
    localStorage.getItem('username'),
    localStorage.getItem('password'),
  );
  farm.info()
    .then((res) => {
      Object.values(res.client.modules).forEach((module) => {
        const script = document.createElement('script');
        script.src = module.js;
        script.id = `field-module-${module.name}`;
        script.type = 'module';
        script.async = true;
        script.onload = () => {
          const config = window.farmOS.modules[module.name];
          const plugin = utils.createFieldModule(config);
          Vue.use(plugin, { store, router });
        };
        script.onerror = () => console.error(`Error installing ${module.label} module`);
        document.body.appendChild(script);
      });
    })
    .finally(() => new Vue({
      el,
      store,
      router,
      components: { App },
      template: '<App/>',
    }));
};
