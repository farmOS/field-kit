import { entities } from 'farmos';

const nomenclature = {
  entities: Object.entries(entities).reduce((obj, [name, { nomenclature: n }]) => ({
    ...obj,
    [name]: n,
  }), {}),
};

export const entityMethods = fn => Object.values(nomenclature.entities)
  .reduce((methods, entNames) => ({ ...methods, ...fn(entNames) }), {});

export default nomenclature;
