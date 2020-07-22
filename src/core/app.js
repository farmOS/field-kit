import Vue from 'vue';
import farm from './store/farmClient';
import router from './router';
import store from './store';
import App from './App.vue'; // eslint-disable-line import/extensions
import './normalize.css';
import './bootstrap-simplex.min.css';
import './vars.css';
import './main.css';
import utils from '../utils';
import createFieldModule from '../utils/createFieldModule';
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

const loadFieldModule = (module) => {
  const script = document.createElement('script');
  script.src = `${localStorage.getItem('host')}/${module.js}`;
  script.id = `field-module-${module.name}`;
  script.type = 'module';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    const config = window.farmOS.modules[module.name];
    const plugin = createFieldModule(config);
    Vue.use(plugin, { store, router });
  };
  // eslint-disable-next-line no-console
  script.onerror = () => console.error(`Error installing ${module.label} module`);
  document.body.appendChild(script);
};

const rerouteToMyLogsIfNoOtherModules = (modules) => {
  if (!modules || modules.length < 1) {
    router.addRoutes([
      {
        path: '/',
        redirect: '/logs',
      },
    ]);
  } else {
    router.addRoutes([
      {
        path: '/',
        redirect: '/home',
      },
    ]);
  }
};

export default (el, buildtimeMods) => {
  // Load build-time modules
  if (buildtimeMods !== undefined && buildtimeMods.length > 0) {
    buildtimeMods
      .map(createFieldModule)
      .forEach(p => Vue.use(p, { store, router }));
  }

  farm().info()
    .then((res) => {
      if (res?.client?.modules) {
        Object.values(res.client.modules).forEach(loadFieldModule);
        localStorage.setItem('modules', JSON.stringify(res.client.modules));
      }
      rerouteToMyLogsIfNoOtherModules(res?.client?.modules);
    })
    // If the request fails, we can still load modules from cache.
    .catch(() => {
      const modules = JSON.parse(localStorage.getItem('modules'));
      if (modules) {
        Object.values(modules).forEach(loadFieldModule);
      }
      rerouteToMyLogsIfNoOtherModules(modules);
    })
    .finally(() => new Vue({
      el,
      store,
      router,
      components: { App },
      template: '<App/>',
    }));
};
