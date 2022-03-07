import * as Vue from 'vue';
import * as R from 'ramda';
import wellknown from 'wellknown';
import router from './router';
import store from './store';
import App from './App.vue';
import AppBarOptions from './shell/AppBarOptions.vue';
import mountFieldModule from './field-modules/mount';
import { alert } from './store/errors';
import t from './mixins/t';
import farm from './farm';
import utils from './utils';
import components from '../components';
import './normalize.css';
import './bootstrap-simplex.min.css';
import './vars.css';
import './main.css';

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
window.Vue = Vue;

// Because the native window.alert() function blocks all execution, which could
// interfere with background processes, and because it could easily be confused
// with the app shell's alert function, reassign the native alert to another
// variable and overwrite window.alert with the app shell's implementation.
window.dangerouslyBlockingAlert = window.alert;
window.alert = alert;

const app = window.Vue.createApp(App);
window.app = app;

// Use Vuex and Vue Router plugins
app.use(store);
app.use(router);

// Globally apply the t mixin, which provides translations along with the l10n module
app.mixin(t);

// Provide a global function for mounting Field Modules with all its dependencies.
window.farmOS.mountFieldModule = mountFieldModule({ app, router });

// Register the shared component library globally so they can be accessed from
// any other component and field module.
components.forEach((c) => { app.component(c.name, c); });

app.component('app-bar-options', AppBarOptions);

export default app;
