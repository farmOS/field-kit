import Vue from 'vue';
import components from '../src/components';
import '../src/core/normalize.css';
import '../src/core/bootstrap-simplex.min.css';
import './override-bootstrap.css';
import '../src/core/vars.css';
import '../src/core/main.css';

const mockT = {
  methods: { $t: str => str },
};

components.forEach(c => { Vue.component(c.name, c); });
Vue.mixin(mockT);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  options: {
    storySort: {
      order: ['Intro', 'Layout', 'Content', 'Icons'], 
    },
  },
}