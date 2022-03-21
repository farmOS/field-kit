require('jsdom-global')();

global.expect = require('expect');

const makeLocalStorage = () => {
  let store = {};
  return {
    getItem(key) {
      return store[key];
    },
    setItem(key, val) {
      store[key] = val;
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
}

global.localStorage = makeLocalStorage();