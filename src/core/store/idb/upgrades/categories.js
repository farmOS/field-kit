export default [
  {
    version: 1,
    onUpgrade(event) {
      return new Promise((resolve, reject) => {
        const db = event.target.result;
        try {
          db.createObjectStore('categories', { keyPath: 'tid' });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
  },
];
