import { entityMethods } from '../store/nomenclature';

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

export default {
  methods: {
    ...entityMethods(({ name, shortName, shortPlural }) => ({
      [`create${capitalize(shortName)}`](props) {
        return this.$store.dispatch('createEntity', { name, props });
      },
      [`update${capitalize(shortName)}`](props) {
        return this.$store.dispatch('updateEntity', { name, props });
      },
      [`delete${capitalize(shortName)}`](id) {
        return this.$store.dispatch('deleteEntity', { name, id });
      },
      [`load${capitalize(shortPlural)}`](filter, options) {
        return this.$store.dispatch('loadEntities', { name, filter, options });
      },
      [`fetch${capitalize(shortPlural)}`](filter, options) {
        return this.$store.dispatch('fetchEntities', { name, filter, options });
      },
      [`sync${capitalize(shortPlural)}`](filter, options) {
        return this.$store.dispatch('syncEntities', { name, filter, options });
      },
    })),
  },
};
