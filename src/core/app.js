import Vue from 'vue';
import ShutdownNotice from './ShutdownNotice.vue'; // eslint-disable-line import/extensions
import './normalize.css';
import './bootstrap-simplex.min.css';
import './vars.css';
import './main.css';
import components from '../components';

components.forEach((c) => { Vue.component(c.name, c); });

export default el => new Vue({
  el,
  components: { ShutdownNotice },
  template: '<ShutdownNotice/>',
});
