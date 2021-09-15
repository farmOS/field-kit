const nomenclature = {
  entities: {
    asset: {
      name: 'asset',
      shortName: 'asset',
      plural: 'assets',
      shortPlural: 'assets',
      display: 'Asset',
      displayPlural: 'Assets',
    },
    log: {
      name: 'log',
      shortName: 'log',
      plural: 'logs',
      shortPlural: 'logs',
      display: 'Log',
      displayPlural: 'Logs',
    },
    plan: {
      name: 'plan',
      shortName: 'plan',
      plural: 'plans',
      shortPlural: 'plans',
      display: 'Plan',
      displayPlural: 'Plans',
    },
    quantity: {
      name: 'quantity',
      shortName: 'quantity',
      plural: 'quantities',
      shortPlural: 'quantities',
      display: 'Quantity',
      displayPlural: 'Quantities',
    },
    taxonomy_term: {
      name: 'taxonomy_term',
      shortName: 'term',
      plural: 'taxonomy_terms',
      shortPlural: 'terms',
      display: 'Taxonomy Term',
      displayPlural: 'Taxonomy Terms',
    },
    user: {
      name: 'user',
      shortName: 'user',
      plural: 'users',
      shortPlural: 'users',
      display: 'User',
      displayPlural: 'Users',
    },
  },
};

export const entityMethods = fn => Object.values(nomenclature.entities)
  .reduce((methods, entNames) => ({ ...methods, ...fn(entNames) }), {});

export default nomenclature;
