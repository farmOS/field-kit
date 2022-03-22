function onUpgradeCreateObjectStore(event, options) {
  const { name, keyPath = 'id', autoIncrement = false } = options;
  return new Promise((resolve, reject) => {
    const db = event.target.result;
    try {
      db.createObjectStore(name, { keyPath, autoIncrement });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

const upgrades = [{
  version: 1,
  onUpgrade: onUpgradeCreateObjectStore,
}];

export default {
  entities: {
    version: 1,
    name: 'entities',
    stores: [
      {
        name: 'asset',
        upgrades,
      },
      {
        name: 'log',
        upgrades,
      },
      {
        name: 'plan',
        upgrades,
      },
      {
        name: 'quantity',
        upgrades,
      },
      {
        name: 'taxonomy_term',
        upgrades,
      },
      {
        name: 'user',
        upgrades,
      },
    ],
  },
  config_documents: {
    version: 1,
    name: 'config_documents',
    stores: [
      {
        name: 'asset',
        keyPath: 'key',
        upgrades,
      },
      {
        name: 'log',
        keyPath: 'key',
        upgrades,
      },
      {
        name: 'plan',
        keyPath: 'key',
        upgrades,
      },
      {
        name: 'quantity',
        keyPath: 'key',
        upgrades,
      },
      {
        name: 'taxonomy_term',
        keyPath: 'key',
        upgrades,
      },
      {
        name: 'user',
        keyPath: 'key',
        upgrades,
      },
    ],
  },
};
