# Field Kit / Field Modules API
farmOS Field Kit is a not just an application but a framework for building concise user interfaces that capture specialized subsets of farm-related data. We use a [microfrontend](https://www.martinfowler.com/articles/micro-frontends.html) architecture to deliver these UI's at runtime to the Field Kit client from any farmOS server. These are called Field Modules. They make up the "kit" that farmers take to the "field".

# Getting started

[Instructions will go here once we have a template repo.]

# Basic requirements
The Field Module API is fairly flexible, granting a fair amount of latitude to the developer to make their own choices. There are only a few basic requirements in order to load a Field Module into Field Kit. The primary interface is the main module object, which is mounted in the module's main entry point, `index.js`:

```js
// src/FieldModule/MyModule/js/index.js
import ModuleWidget from './components/ModuleWidget';
import Module from './components/Module';
import ModuleMenuBar from './components/ModuleMenuBar';

const mod = {
  name: 'my-mod',
  label: 'My Module',
  widget: ModuleWidget,
  routes: [
    {
      name: 'module',
      path: '/module',
      components: {
        default: Module,
        menubar: ModuleMenuBar,
      },
    },
  ],
};

window.farmOS.mountFieldModule(mod);
```

The `name` must be a unique identifier which is used internallay by Field Kit to distinguish your module from all others. The `label` will be displayed in the main menu with a link to your module's main route. The `widget` is a Vue component which is displayed on the home screen. It will automatically be nested in a card with your `label` as a heading, but otherwsie it can be customized to display info about your module and provide links to various routes within your module. Finally, `routes` is an array of `RouteConfig` objects, as specified in the [Vue router API](https://router.vuejs.org/api/#routes).

Once your module object is complete, you can mount it by calling the globale `farmOS.mountFieldModule()` method.
