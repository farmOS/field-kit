export default [
  {
    version: 1,
    onUpgrade(event) {
      return new Promise((resolve, reject) => {
        const db = event.target.result;
        try {
          db.createObjectStore('equipment', { keyPath: 'id' });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
  },
];
