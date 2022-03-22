import { head, tail } from 'ramda';
import databases from './databases';
import runUpgrades from './runUpgrades';

function openDatabase(dbName) {
  const config = databases[dbName];
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.name, config.version);
    request.onsuccess = () => resolve(request.result);
    request.onerror = event => reject(event.target.error);
    request.onupgradeneeded = runUpgrades(config);
  });
}

export function getRecords(dbName, storeName, query) {
  return openDatabase(dbName).then(db => new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    const getRecord = key => new Promise((res, rej) => {
      const request = store.get(key);
      request.onsuccess = event => res([key, event.target.result]);
      request.onerror = event => rej(
        new Error(`Could not retrieve record by key ${key}: ${event.target.error}`),
      );
    });
    const getRecordsByKeys = (keys, results = {}) => {
      if (keys.length === 0) {
        return Promise.resolve(results);
      }
      if (keys.length === 1) {
        return getRecord(head(keys))
          .then(([key, val]) => ({ ...results, [key]: val }));
      }
      return getRecord(head(keys))
        .then(([key, val]) => (getRecordsByKeys(tail(keys), { ...results, [key]: val })));
    };
    if (!query) {
      const request = store.getAll();
      request.onsuccess = event => resolve(event.target.result);
      request.onerror = event => reject(event.target.error);
    } else if (Array.isArray(query)) {
      getRecordsByKeys(query)
        .then(resolve)
        .catch(reject);
    } else if (typeof query === 'function') {
      const request = store.openCursor();
      const results = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (query(cursor.value)) {
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = event => reject(event);
    } else {
      getRecord(query).then(resolve).catch(reject);
    }
  }));
}

export function count(dbName, storeName, key) {
  return openDatabase(dbName).then(db => new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    const request = store.count(key);
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(new Error(event.target.error));
  }));
}

export function saveRecord(dbName, storeName, record, key) {
  return openDatabase(dbName).then(db => new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const request = store.put(record, key);
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(new Error(event.target.error));
  }));
}

export function deleteRecord(dbName, storeName, query) {
  return openDatabase(dbName).then(db => new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    if (typeof query === 'function') {
      const request = store.openCursor();
      const results = { deleted: [] };
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (query(cursor.value)) {
            results.deleted.push(cursor.value);
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = event => reject(event);
    } else {
      const request = store.delete(query);
      request.onsuccess = event => resolve(event.target.result);
      request.onerror = event => reject(event.target.error);
    }
  }));
}

export const deleteDatabase = dbName => new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase(dbName);
  request.onsuccess = resolve;
  request.onerror = reject;
});
