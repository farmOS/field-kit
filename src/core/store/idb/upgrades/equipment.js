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
  {
    /**
     * Starting with this version, equipment will merely be a getter value,
     * derived from assets, so we don't need to fetch or store it separately.
     */
    version: 4,
    onUpgrade(event) {
      return new Promise((resolve, reject) => {
        const db = event.target.result;
        try {
          db.deleteObjectStore('equipment');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
  },
];
