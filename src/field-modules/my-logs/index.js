import modConfig from './module.config';
import createRoutes from '@/utils/createRoutes';
import routes from './routes';
import DrawerItems from './components/DrawerItems';

export default {
  install(Vue, { router, store }) {
    store.commit('updateModule', modConfig);
    Vue.component(DrawerItems.name, DrawerItems);
    router.addRoutes(createRoutes(Vue, modConfig, routes));
  },
};
