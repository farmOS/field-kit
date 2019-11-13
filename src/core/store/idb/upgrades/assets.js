export default [
  {
    version: 1,
    onUpgrade(event) {
      return new Promise((resolve, reject) => {
        const db = event.target.result;
        try {
          db.createObjectStore('assets', { keyPath: 'id' });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
  },
];
