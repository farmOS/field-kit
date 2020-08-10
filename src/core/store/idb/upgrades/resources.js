import defaultResources from '../../defaultResources';

export default [
  {
    version: 5,
    onUpgrade(event) {
      return new Promise((resolve, reject) => {
        try {
          const db = event.target.result;
          db.createObjectStore('resources');
          const logTypes = JSON.parse(localStorage.getItem('logTypes')) || defaultResources.log;
          const store = event.target.transaction.objectStore('resources');
          const request = store.put(logTypes, 'log');
          request.onerror = e => reject(new Error(e.target.error));
          request.onsuccess = e => resolve(e.target.result);
        } catch (error) {
          reject(error);
        }
      });
    },
  },
];
