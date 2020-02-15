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
  /**
   * VERSION 2
   * - Change the keypath from local_id to localID.
   * - Disable autoincrement.
   * - Add the my-logs module to every log.
   */
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
  /**
   * VERSION 3
   * - Convert strings to integers.
   * - Change the `remoteUri` prop to `url` to be consistent w/ the server.
   * - Convert `notes` back to objects instead of just plain strings.
   */
  {
    version: 3,
    onUpgrade(event) {
      const isInt = string => /^[-+]?(\d+|Infinity)$/.test(string);
      const reviver = (key, val) => (typeof val === 'string' && isInt(val) ? +val : val);
      const parser = log => JSON.parse(JSON.stringify(log), reviver);
      const store = event.target.transaction.objectStore('logs');
      return new Promise((resolve, reject) => {
        const getRequest = store.getAll();
        getRequest.onsuccess = (getEvent) => {
          const updatedLogs = getEvent.target.result
            .map(log => parser({
              ...log,
              url: log.remoteUri,
              notes: {
                data: {
                  value: log.notes.data,
                  format: 'farm_format',
                },
                changed: log.notes.changed,
              },
            }));
          resolve(updatedLogs);
        };
        getRequest.onerror = reject;
      }).then(logs => Promise.all(logs.map(log => new Promise((resolve, reject) => {
        const putRequest = store.put(log);
        putRequest.onsuccess = resolve;
        putRequest.onerror = reject;
      }))));
    },
  },
];
