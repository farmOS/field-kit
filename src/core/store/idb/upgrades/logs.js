export default [
  {
    version: 1,
    onUpgrade(event) {
      return new Promise((resolve, reject) => {
        const db = event.target.result;
        try {
          db.createObjectStore('logs', {
            keyPath: 'local_id',
            autoIncrement: true,
          });
          resolve();
        } catch (error) {
          reject(error);
        }
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
];
