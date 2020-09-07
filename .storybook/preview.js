import Vue from 'vue';
import components from '../src/components';
import '../src/core/normalize.css';
import '../src/core/bootstrap-simplex.min.css';
import '../src/core/vars.css';
import '../src/core/main.css';

components.forEach(c => { Vue.component(c.name, c); });

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}