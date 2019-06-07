import config from './idb.config';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.name, config.version);
    request.onerror = event => reject(event.target.errorcode);
    request.onsuccess = () => resolve(this.result);
    request.onupgradeneeded = (event) => {
      const db = event.currentTarget.result;
      config.stores.forEach(({ name, keyPath, autoIncrement }) => {
        db.createObjectStore(name, { keyPath, autoIncrement });
      });
    };
  });
}

function getRecords(db, storeName) {
  // do something
}

function saveRecord(db, storeName, record) {
  // do something
}

function deleteRecord(db, storeName, key) {
  // do something
}

function deleteStore(db, storeName) {
  // do something
}

export {
  openDatabase,
  getRecords,
  saveRecord,
  deleteRecord,
  deleteStore,
};
