import Vue, { configureCompat } from 'vue';
import * as R from 'ramda';
import wellknown from 'wellknown';
import router from './router';
import store from './store';
import App from './App.vue';
import { mountFieldModule } from './fieldModules';
import t from './mixins/t';
import farm from './farm';
import utils from './utils';
import components from '../components';
import './normalize.css';
import './bootstrap-simplex.min.css';
import './vars.css';
import './main.css';

configureCompat({
  MODE: 3,
});

// Attach common libs & utils to the global namespace so Field Modules can access them.
if (window.farmOS === undefined) {
  window.farmOS = farm;
} else {
  window.farmOS = {
    ...window.farmOS,
    ...farm,
  };
}
window.farmOS.utils = utils;
window.farmOS.lib = {
  R,
  wellknown,
};

const app = Vue.createApp(App);

// Use Vuex and Vue Router plugins
app.use(store);
app.use(router);

// Globally apply the t mixin, which provides translations along with the l10n module
app.mixin(t);

// Provide a global function for mounting Field Modules with all its dependencies.
window.farmOS.mountFieldModule = mountFieldModule({ app, router, store });

// Register the shared component library globally so they can be accessed from
// any other component and field module.
components.forEach((c) => { app.component(c.name, c); });

export default app;
