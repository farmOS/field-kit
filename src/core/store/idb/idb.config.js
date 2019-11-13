export default {
  version: 2,
  name: 'farmos',
  stores: [
    {
      name: 'logs',
      keyPath: 'localID',
      autoIncrement: false,
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
        },
        {
          version: 2,
          onUpgrade(event) {
            const db = event.target.result;
            const oldStore = event.target.transaction.objectStore('logs');
            const newStore = db.createObjectStore('logs-temp', {
              keyPath: 'localID',
              autoIncrement: false,
            });
            return new Promise((resolve, reject) => {
              const requestGetAll = oldStore.getAll();
              requestGetAll.onsuccess = (eventGetAll) => {
                const logs = eventGetAll.target.result.map((log) => {
                  const newLog = {
                    ...log,
                    localID: log.local_id,
                    modules: ['my-logs'],
                  };
                  delete newLog.local_id;
                  return newLog;
                });
                resolve(logs);
              };
              requestGetAll.onerror = reject;
            }).then(logs => Promise.all(logs.map(log => new Promise((resolve, reject) => {
              const requestAdd = newStore.put(log);
              requestAdd.onsuccess = resolve;
              requestAdd.onerror = reject;
            })))).then(() => {
              db.deleteObjectStore('logs');
              newStore.name = 'logs';
            });
          },
        },
      ],
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
