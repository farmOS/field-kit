import dataModule from './store';

export default {
  install(Vue, {store}) {
    store.registerModule('data', dataModule);
  }
}
