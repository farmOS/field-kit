import { pool } from '../utils/PromisePool';
import { entityMethods } from '../store/nomenclature';

const POOL_TIMEOUT = 500;

export default {
  emits: ['set-widget-filter'],
  methods: {
    ...entityMethods((names) => {
      const { name, display, displayPlural } = names;
      let loader; let fetcher;
      return {
        [`create${display}`](props) {
          return this.$store.dispatch('createEntity', { name, props });
        },
        [`update${display}`](props) {
          return this.$store.dispatch('updateEntity', { name, props });
        },
        [`delete${display}`](id) {
          return this.$store.dispatch('deleteEntity', { name, id });
        },
        [`load${displayPlural}`](filter, options) {
          this.$emit('set-widget-filter', filter);
          if (!loader) {
            const load = filters =>
              this.$store.dispatch('loadEntities', { name, filter: filters, options });
            loader = pool(load, POOL_TIMEOUT);
          }
          const loadPool = loader(filter);
          return loadPool;
        },
        [`fetch${displayPlural}`](filter, options) {
          this.$emit('set-widget-filter', filter);
          if (!fetcher) {
            const fetch = filters =>
              this.$store.dispatch('fetchEntities', { name, filter: filters, options });
            fetcher = pool(fetch, POOL_TIMEOUT);
          }
          return fetcher(filter);
        },
      };
    }),
  },
};
