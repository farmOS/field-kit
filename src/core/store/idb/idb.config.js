export default {
  version: 1,
  name: 'farmos',
  stores: [
    {
      name: 'logs',
      keyPath: 'local_id',
      autoIncrement: true,
      upgrades: [
        {
          version: 1,
          onUpgrade(event) {
            return new Promise((resolve, reject) => {
              const db = event.target.result;
              const store = db.createObjectStore('logs', {
                keyPath: 'local_id',
                autoIncrement: true,
              });
              store.transaction.oncomplete = resolve;
              store.transaction.onerror = reject;
            });
          },
    {
      name: 'assets',
      keyPath: 'id',
      autoIncrement: false,
      upgrades: [
        {
          version: 1,
          onUpgrade(event) {
            return new Promise((resolve, reject) => {
              const db = event.target.result;
              const store = db.createObjectStore('assets', { keyPath: 'id', autoIncrement: true });
              store.transaction.oncomplete = resolve;
              store.transaction.onerror = reject;
            });
          },
        },
      ],
    },
    {
      name: 'areas',
      keyPath: 'tid',
      autoIncrement: false,
      upgrades: [
        {
          version: 1,
          onUpgrade(event) {
            return new Promise((resolve, reject) => {
              const db = event.target.result;
              const store = db.createObjectStore('areas', { keyPath: 'tid' });
              store.transaction.oncomplete = resolve;
              store.transaction.onerror = reject;
            });
          },
        },
      ],
    },
    {
      name: 'units',
      keyPath: 'tid',
      autoIncrement: false,
      upgrades: [
        {
          version: 1,
          onUpgrade(event) {
            return new Promise((resolve, reject) => {
              const db = event.target.result;
              const store = db.createObjectStore('units', { keyPath: 'tid' });
              store.transaction.oncomplete = resolve;
              store.transaction.onerror = reject;
            });
          },
        },
      ],
    },
    {
      name: 'categories',
      keyPath: 'tid',
      autoIncrement: false,
      upgrades: [
        {
          version: 1,
          onUpgrade(event) {
            return new Promise((resolve, reject) => {
              const db = event.target.result;
              const store = db.createObjectStore('categories', { keyPath: 'tid' });
              store.transaction.oncomplete = resolve;
              store.transaction.onerror = reject;
            });
          },
        },
      ],
    },
    {
      name: 'equipment',
      keyPath: 'id',
      autoIncrement: false,
      upgrades: [
        {
          version: 1,
          onUpgrade(event) {
            return new Promise((resolve, reject) => {
              const db = event.target.result;
              const store = db.createObjectStore('equipment', { keyPath: 'id' });
              store.transaction.oncomplete = resolve;
              store.transaction.onerror = reject;
            });
          },
        },
      ],
    },
  ],
};
