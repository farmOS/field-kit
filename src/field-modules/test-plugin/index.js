import TestA from './components/TestComponentA.js'; // eslint-disable-line import/extensions
import TestAMenu from './components/TestComponentAMenuBar.js'; // eslint-disable-line import/extensions
import TestB from './components/TestComponentB.js'; // eslint-disable-line import/extensions
import TestBMenu from './components/TestComponentBMenuBar.js'; // eslint-disable-line import/extensions
// import { name } from './manifest.json'; // can't be imported b/c it's .json

// Hardcode the name temporarily since we can't import
const name = 'Test';

// Define a global install function with a unique name that will be called
// by the app's loading function (app.js). This function should comply with the
// Vue plugin spec: https://vuejs.org/v2/guide/plugins.html#Writing-a-Plugin
window[`install${name}`] = (Vue, { router }) => {
  const TestComponentA = Vue.component(TestA.name, TestA);
  const TestComponentAMenuBar = Vue.component(TestA.name, TestAMenu);
  const TestComponentB = Vue.component(TestB.name, TestB);
  const TestComponentBMenuBar = Vue.component(TestB.name, TestBMenu);
  router.addRoutes([
    {
      name: 'egg-form',
      path: '/eggs',
      components: {
        default: TestComponentA,
        menubar: TestComponentAMenuBar,
      },
      children: [
        {
          name: 'egg-edit',
          path: 'edit',
          components: {
            default: TestComponentB,
            menubar: TestComponentBMenuBar,
          },
        },
      ],
    },
  ]);
};
