import dataModule from './dataModule';

export default {
  install(Vue, {store}) {
    store.registerModule('data', dataModule);
  }
}
