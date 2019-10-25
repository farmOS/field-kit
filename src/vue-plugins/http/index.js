import module from './module';

export default {
  install(Vue, { store }) {
    store.registerModule('http', module);
  },
};
