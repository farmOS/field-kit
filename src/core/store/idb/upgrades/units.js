export default [
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
];
