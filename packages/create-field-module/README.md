# `create-field-module`
Scaffold a Field Module for development with farmOS Field Kit.

## Quick start
If you have the [requirements](#requirements) installed, the project can be scaffolded from your terminal:

```sh
npm create @farmos.org/field-module my-custom-module
```

You will be asked to install `@farmos.org/create-field-module` locally if this is the first time you've run it; enter `y` to proceed. Also note that the first argument above, `my-custom-module`, is optional, and can be whatever name you choose for your project, so long as it is adheres to [npm naming conventions](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#name). If you omit the name as a command argument, or you wish to change it, you can do so from the following prompt:

```sh
## ✔ Module name (kebab-case): … my-custom-module
## ✔ Module label to display in the UI: … My Custom Module
## ✔ Description: … A field module that does something really special.
```

This will scaffold a project with the following directory structure, with the project name, label and description used to populate `package.json`, `module.config.js` and other files:

```sh
my-custom-module
├── module.config.js
├── package.json
└── src
    ├── MyCustomModuleContainer.vue
    ├── MyCustomModuleWidget.vue
    └── routes.js
```

Then you can `cd` into your project, install dependencies with npm (or the package manager of your choice) and start the development environment:

```sh
cd my-custom-module
npm i
npm start
```

When you're ready to package your Field Module for distribution with farmOS, run the build command:

```sh
npm run build
```

This will generate a distributable with the following directory structure:

```sh
my-custom-module/dist
└── farm_fieldkit_my_custom_module
    ├── config
    │   └── install
    │       └── farm_fieldkit.field_module.my_custom_module.yml
    ├── farm_fieldkit_my_custom_module.info.yml
    ├── farm_fieldkit_my_custom_module.libraries.yml
    └── js
        └── my-custom-module.0-0-0.js
```

This can then be zipped or compressed as a tarball and installed as a [farmOS module](https://farmos.org/development/module/).

## Requirements
- [Node.js](https://nodejs.org/) v18 or higher
- `npm` (included with Node.js) v9 or higher, or equivalent package manager

A general knowledge of JavaScript, Vue.js and Node is also assumed.
