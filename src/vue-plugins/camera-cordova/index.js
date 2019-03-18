import module from './module';

export default {
  install(Vue, { store }) {
    store.registerModule('camera', module);
  },
};
