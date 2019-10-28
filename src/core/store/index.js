import Vue from 'vue';
import Vuex from 'vuex';
import shellModule from './shellModule';
import farmModule from './farmModule';
import idbModule from './idb/module';
import makeIDBSubscriber from './idb/subscriber';
import httpModule from './http/module';
import authModule from './authModule';
import camModule from './camModule';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    shell: shellModule,
    farm: farmModule,
    idb: idbModule,
    http: httpModule,
    auth: authModule,
    cam: camModule,
  },
});

// Add subscribers so the DB automatically caches data when changes happen in
// the farmModule.
const idbSubscriber = makeIDBSubscriber(store);
store.subscribe(idbSubscriber);

export default store;
