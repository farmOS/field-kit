import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import * as R from 'ramda';
import wellknown from 'wellknown';
import router from './router';
import store from './store';
import App from './App.vue';
import AppBarOptions from './shell/AppBarOptions.vue';
import mountFieldModule from './field-modules/mount';
import { alert } from './store/alert';
import t from './mixins/t';
import farm from './farm';
import * as utils from './utils';
import components from '../components';
import './normalize.css';
import './bootstrap-simplex.min.css';
import './vars.css';
import './main.css';

const app = Vue.createApp(App);

// Vue must be on the global scope so it can be accessed by Field Modules for
// runtime rendering. VueRouter's utils (eg, `useRouter`) and the app instance
// are just provided for easy access by Field Modules.
window.Vue = Vue;
window.VueRouter = VueRouter;
window.app = app;

// All other libraries, third part and internal, are placed on the global `lib`
// namespace, for access by Field Modules. It's frozen to prevent tampering.
window.lib = Object.freeze({
  ...utils,
  R,
  wellknown,
  isUnsynced: farm.isUnsynced,
  mountFieldModule: mountFieldModule({ app, router }),
});

// Because the native window.alert() function blocks all execution, which could
// interfere with background processes, and because it could easily be confused
// with the app shell's alert function, reassign the native alert to another
// variable and overwrite window.alert with the app shell's implementation.
window.dangerouslyBlockingAlert = window.alert;
window.alert = alert;

// Use Vuex and Vue Router plugins
app.use(store);
app.use(router);

// Globally apply the t mixin, which provides translations along with the l10n module
app.mixin(t);

// Register the shared component library globally so they can be accessed from
// any other component and field module.
components.forEach((c) => { app.component(c.name, c); });

app.component('app-bar-options', AppBarOptions);

export default app;
