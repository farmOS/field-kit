import { head, tail } from 'ramda';
import config from './idb.config';
import { filterAndSort, runUpgrades } from '../../../utils/runUpgrades';

/**
 * Initialize a global counter for each store, eg:
 * const counter = {
 *  logs: 0,
 *  assets: 0,
 *  areas: 0,
 *  ...etc
 * }
 */
const counter = config.stores.reduce((countObj, store) => ({ ...countObj, [store.name]: 0 }), {});

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.name, config.version);
    request.onerror = event => reject(event.target.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = event => config.stores
      .map(store => store.upgrades.reduce(filterAndSort(event.oldVersion), []))
      .forEach(upgrades => runUpgrades(event)(upgrades));
  });
}

export function getAllKeys(storeName) {
  return openDatabase().then(db => new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    const request = store.getAllKeys();
    request.onerror = event => reject(event.target.error);
    request.onsuccess = event => resolve(event.target.result);
  }));
}

export function getRecords(storeName, query) {
  return openDatabase().then(db => new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    const getRecord = key => new Promise((res, rej) => {
      const request = store.get(key);
      request.onerror = event => rej(
        new Error(`Could not retrieve record by key ${key}: ${event.target.error}`),
      );
      request.onsuccess = event => res([key, event.target.result]);
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
      request.onerror = event => reject(event.target.error);
      request.onsuccess = event => resolve(event.target.result);
    } else if (Array.isArray(query)) {
      getRecordsByKeys(query)
        .then(resolve)
        .catch(reject);
    } else if (typeof query === 'function') {
      const request = store.openCursor();
      const results = [];
      request.onerror = event => reject(event);
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
    } else {
      getRecord(query).then(resolve).catch(reject);
    }
  }));
}

export function generateLocalID(storeName) {
  // Set a local counter so we don't increment the store counter more than once.
  let i = 1;
  return openDatabase().then(db => new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    const request = store.openCursor(null, 'prev');
    request.onerror = event => reject(new Error(event.target.erorr));
    request.onsuccess = (event) => {
      // Return if the cursor has already moved back more than once.
      if (i > 1) { return; }
      let newID;
      const cursor = event.target.result;
      if (cursor) {
        cursor.continue();
        if (counter[storeName] > cursor.value.localID) {
          newID = counter[storeName] + 1;
        } else {
          newID = cursor.value.localID + 1;
        }
      } else {
        newID = counter[storeName] + 1;
      }
      counter[storeName] = newID;
      i += 1;
      resolve(newID);
    };
  }));
}

export function count(storeName, key) {
  return openDatabase().then(db => new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    const request = store.count(key);
    request.onerror = event => reject(new Error(event.target.error));
    request.onsuccess = event => resolve(event.target.result);
  }));
}

export function saveRecord(storeName, record, key = null) {
  return openDatabase().then(db => new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const request = key ? store.put(record, key) : store.put(record);
    request.onerror = event => reject(new Error(event.target.error));
    request.onsuccess = event => resolve(event.target.result);
  }));
}

export function deleteRecord(storeName, key) {
  return openDatabase().then(db => new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  }));
}

export function clearStore(storeName) {
  return openDatabase().then(db => new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const request = store.clear();
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  }));
}
