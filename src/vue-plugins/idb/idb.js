import config from './idb.config';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.name, config.version);
    request.onerror = event => reject(event.target.errorcode);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.currentTarget.result;
      config.stores.forEach(({ name, keyPath, autoIncrement }) => {
        db.createObjectStore(name, { keyPath, autoIncrement });
      });
    };
  });
}

function getRecords(db, storeName) {
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    const request = store.getAll();
    request.onerror = event => reject(event.target);
    request.onsuccess = event => resolve(event.target.result);
  });
}

function saveRecord(db, storeName, record) {
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const request = store.put(record);
    request.onerror = event => reject(new Error(event.target.errorcode));
    request.onsuccess = event => resolve(event.target.result);
  });
}

function deleteRecord(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.error);
  });
}

function clearStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const request = store.clear();
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.error);
  });
}

export {
  openDatabase,
  getRecords,
  saveRecord,
  deleteRecord,
  clearStore,
};
