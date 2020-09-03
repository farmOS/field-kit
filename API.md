# Field Kit / Field Modules API
farmOS Field Kit is a not just an application but a framework for building concise user interfaces that capture specialized subsets of farm-related data. We use a [microfrontend](https://www.martinfowler.com/articles/micro-frontends.html) architecture to deliver these UI's at runtime to the Field Kit client from any farmOS server. These are called Field Modules. They make up the "kit" that farmers take to the "field".

## Contents
- [Getting started](#getting-started)
- [Basic Requirements](#basic-requirements)
- [Logs API](#logs-api)
  - [Loading and reading logs as props](#loading-and-reading-logs-as-props)
  - [Creating, updating and deleting logs](#creating-updating-and-deleting-logs)
  - [Syncing logs with the server](#syncing-logs-with-the-server)
- [API reference](#api-reference)
  - [Module object](#module-object)
  - [Vuex mutations](#vuex-mutations)
  - [Vuex actions](#vuex-actions)
  - [farmLog utilities](#farmlog-utilities)

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

The `name` must be a unique identifier, which is used internallay by Field Kit to distinguish your module from all others. The `label` will be displayed in the main menu with a link to your module's main route. The `widget` is a Vue component which is displayed on the home screen. It will automatically be nested in a card with your `label` as a heading, but otherwsie it can be customized to display info about your module and provide links to various routes within your module. Finally, `routes` is an array of `RouteConfig` objects, as specified in the [Vue router API](https://router.vuejs.org/api/#routes).

Once your module object is complete, you can mount it by calling the global `farmOS.mountFieldModule()` method.

# Logs API
## Loading and reading logs as props
Logs will be passed down to your module's root component via [Vue.js props](https://vuejs.org/v2/guide/components.html#Passing-Data-to-Child-Components-with-Props) as `logs`, an array of log objects. However, until Field Kit knows what logs your module requires, that array will either be empty or comprised of arbitrary logs left there by a previous module. To tell Field Kit which logs you want loaded from the local IndexedDB cache, use the `loadLogs` [Vuex action](https://vuex.vuejs.org/guide/actions.html).

> __Pro Tip:__ For convenience, any Vuex actions and mutations that are intended as a part of this API will be mapped to component methods of the component listed in your module's `routes`, using [`mapAction`](https://vuex.vuejs.org/guide/actions.html#dispatching-actions-in-components) and [`mapMutation`](https://vuex.vuejs.org/guide/mutations.html#committing-mutations-in-components).

As payload, the `loadLogs` action will accept an object with two properties, `filter` and `pass`. The `filter` property is an object that corresponds to the filter object accepted by [farmOS.js](https://github.com/farmOS/farmOS.js). It provides criteria that must _all_ be satisfied in order for a log to be accepted. In other words, all the criteria in the filter object will be `AND`'ed together. The `pass` property, on the other hand, will pass a log if _any_ of the criteria is met, and it is the equivalent of a `OR` operation. The `filter` and `pass` objects themselves will be `OR`'ed together. Here's an example of how they can be dispatched to the `loadLogs` action from within the component's `created` lifecycle hook, which will make sure they're loaded as soon as your component is ready to handle them:

```js
export default {
  name: 'MyModule',
  created() {
    const filter = {
      log_owner: 42,
      done: false,
      type: ['farm_observation', 'farm_activity'],
    };
    
    const pass = {
      unsynced: true,
      timestamp: [1580000000, 1590000000],
    };
    
    this.loadLogs({ filter, pass });
  }
}
```

As with the parameters in farmOS.js's `.log.get()` method, the `filter` properties correspond directly to log properties; logs will be loaded only if their properties match the corresponding filter property provided. If no filter property is provided for a given log property, a log with any value on that property will pass that filter. If an array is provided as a filter property, a log must match any one of the values in that array.

The `pass` object can only include a handful of special properties for `loadLogs`: `synced` and `timestamp`. The `unsynced` property indicates whether you want all unsynced logs loaded as well. This can help guarantee a log doesn't fall through the cracks and never get synced, for instance, if a log gets marked done but isn't synced before the app is quit. The `timestamp` property can accpet a range of timestamps to include, the first element being the start time and the second element being the end time.

Once the logs have been loaded into the Vuex store, they will be passed down directly as props to your module's root component. To access them, you merely need to include them in your components `props` option as `'logs'`:

```js
export default {
  name: 'MyModule',
  props: ['logs'],
}
```

Then you can reference those logs directly in your template as such:

```html
<template>
  <h1>Logs</h1>
  <ul>
    <li v-for="(log, i) in logs" :key='`log-${i}`'>
      {{ log.name }}
    </li>
  </ul>
</template>
```

Logs will have different properties based on their type, as described in the main [farmOS API](https://farmos.org/development/api/#creating-logs). In addition, logs will have a special `localID`, which is an identifier maintained just by Field Kit, independent from the server's `id` property, so we can track logs created in Field Kit before they've been synced.

There are also some special metadata stored with each log as non-enumerable properties, which can only be accessed through special utility functions, and won't for instance show up if you iterate over the object's keys. One important piece of metadata can be the sync status of the log, which can be read with the `isUnsynced` funtion, which can be 'imported' from the global `farmOS` object:

```js
const { isUnsynced } = window.farmOS.utils.farmLog;

const unsyncedLocalIDs = this.logs
  .filter(isUnsynced)
  .map(log => log.localID);
```

## Creating, updating and deleting logs
When you want to create a new log, you can use the `initializeLog` Vuex action. This generates a `localID` for the log then creates a new log object with that `localID` and any initial props you provided as the action's payload. It will be loaded as one of your `logs` props once it's created. The action, like all Vuex actions, is asynchronous because it must make a request to the database first to generate the `localID`, but the promise it returns will resolve to the `localID` of your newly created log. This is helpful in case you want to display that log or push to a route that uses that `localID` as a [route parameter](https://router.vuejs.org/guide/essentials/dynamic-matching.html), as in this example below:

```js
this.initializeLog({ type: 'farm_observation' })
  .then(localID => this.$router
    .push({ path: `my-module/logs/${localID}` }))
```

When you want to modify a log, you can use the `updateLog` mutation, which accepts as payload the log properties you wish to change:

```js
this.updateLog({ localID: 42, name: 'My brand new log name' });
```

Note that you _must include the `localID` of the log_ that you want to update among the other properties that you pass as payload.

To delete a log, you can use the `deleteLog` mutation by passing it the `localID` of the log you wish to delete:

```js
this.deleteLog(42);
```

This only deletes the log locally, and does not delete the log from the server. Currently, there is no way of deleting logs on the server.

## Syncing logs with the server
When you want to fetch logs from the server, you can use the `getLogs` action, which also accepts a `filter` and `pass` object as part of its payload. The `filter` object works the same as it does for `loadLogs`. The `pass` object accepts one additional property, `localIDs`, which accepts an array of numbers corresponding to the `localID` of any of the logs you want included in your get request:

```js
const filter = {
  log_owner: 42,
  done: false,
  type: ['farm_observation', 'farm_activity'],
  timestamp: [1580000000, 1590000000],
};

const pass = {
  localIDs: [1,2,3,5,7,11,13],
};

this.getLogs({ filter, pass });
```

Here we are using the `timestamp` property in the `filter` object, instead of the the `pass` object. This will subtract logs outside of that range, rather than adding logs inside of that range like we did with the `loadLogs` example.

Similarly, you can use the `syncLogs` action to get and send logs, which accepts a payload with the same `filter` and `pass` properties as `getLogs` and `loadLogs`.

It's worth noting that `getLogs` is essentially a composition of Field Kit's internal `loadCachedLogs` and `getRemoteLogs` functions, while `syncLogs` is a composition of `loadCachedLogs`, `getRemoteLogs` and `sendRemoteLogs` functions. It's important that these operations happen in conjunction with one another, to reduce the possibility that data may be duplicated or lost, or that conflicts arise between the server and local device. As a consequence, you shouldn't need to call both `getLogs` and `syncLogs` in quick succession; calling only `syncLogs` will achieve the same effect.

## Home Widget
Logs can be loaded to your Home screen widget by calling a special [Vue event emitter](https://vuejs.org/v2/guide/components.html#Emitting-a-Value-With-an-Event). Your widget's parent component will listen for the `load-[my-module-name]-logs` event, which accpets an object with `filter` and `pass` properties just like the `loadLogs` action. So if your module name was `irrigation-monitor`, you could emit an event like this from your widget component's created lifecycle hook:

```js
created() {
  const filter = { category: 'Irrigation' };
  this.$emit('load-irrigation-monitor-logs', { filter });
}
```

The result of your query will then be passed down to your widget as the `logs` prop when the component is created.

# API reference

## Module object
The module object you mount via `window.mountFieldModule()` has the following properties, all required:

### name
- Type: `String`

A unique identifier for you module that Field Kit Core will use to distinguish your module from others.

### label
- Type: `String`

A human-readable title for your module which will be used in the main menu to link to your module and other places.

### widget
- Type: `Object` (a [Vue component](https://vuejs.org/v2/guide/components.html))

This will be rendered on the Home screen as a card with your `label` as the header.

### routes
- Type: [`Array<RouteConfig>`](https://router.vuejs.org/api/#routes)

The routes for your module.

## Vuex mutations
Mutations are always synchronous and do not have a return value. See the [Vuex docs on mutations](https://vuex.vuejs.org/guide/mutations.html) for more info.

### updateLog
- Payload properties:
  - `localID` (required)
  - Any valid `log` properties for the log type

## Vuex actions
Actions are always synchronous and may return a `Promise`. See the [Vuex docs on actions](https://vuex.vuejs.org/guide/actions.html) for more info.

### getLogs
- Payload properties: 
  - `filter: { <LogProperties>, timestamp: Number }`
  - `pass: { localIDs: [<Number>], timestamp: Number }`

Used to fetch logs from the server; will also load logs from the cache that meet the criteria.

### initializeLog
- Payload properties:
  - Any valid `log` properties for the log type
- Return value:
  - A `Promise` that resolves to the `localID` of the new log

### loadLogs
- Payload properties: 
  - `filter: { <LogProperties>, timestamp: Number }`
  - `pass: { timestamp: Number, unsynced: Boolean }`

Used to load logs from the local cache; will also remove logs from the store which don't meet the criteria.

### syncLogs
- Payload properties: 
  - `filter: { <LogProperties>, timestamp: Number }`
  - `pass: { localIDs: [<Number>], timestamp: Number }`

Used to send logs to the server; will also load logs from the cache and get logs from the server that meet the criteria.

## farmLog utilities

### isUnsynced
- Arguments:
  - `log`
- Return value
  - `Boolean`

Calculates from metadata whether any of the logs properties have not yet been synced with the server.