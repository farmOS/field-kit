import { entities } from 'farmos';

const nomenclature = {
  /**
   * ENTITIES
   * A nested collection of entity names, based on farmOS.js, but structured as:
   * {
   *  log: {
   *    name: 'log',
   *    shortName: 'log',
   *    shortPlural: 'logs',
   *    // etc...
   *  }
   *  // etc...
   * }
   */
  entities: {},
  /**
   * MEMOIZED NOMENCLATURE
   * The same names, but flattened as a lookup table, mapping all names for all
   * valid entities to their cannonical name, as used in IDB. For instance:
   * {
   *  logs: 'log'
   *  Logs: 'log',
   *  // ...
   *  term: 'taxonomy_term',
   *  'Taxonomy Terms': 'taxonomy_term',
   * }
   */
  memoized: {},
};

Object.entries(entities).forEach(([name, { nomenclature: nc }]) => {
  nomenclature.entities[name] = nc;
  Object.values(nc).forEach((form) => { nomenclature.memoized[form] = name; });
});

export const entityMethods = fn => Object.values(nomenclature.entities)
  .reduce((methods, entNames) => ({ ...methods, ...fn(entNames) }), {});

export default nomenclature;
