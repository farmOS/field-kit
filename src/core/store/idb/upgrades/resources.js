export default [
  {
    version: 5,
    onUpgrade(event) {
      return new Promise((resolve, reject) => {
        const db = event.target.result;
        try {
          db.createObjectStore('resources');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
  },
];
