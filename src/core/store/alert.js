import { reactive, readonly } from 'vue';

const store = reactive([]);
const reference = readonly(store);

export { reference as default };

function pushError(error) {
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV === 'development') console.error(error);
  store.push(error);
}

export function alert(error, options = {}) {
  if (Array.isArray(error) && options.concat === false) {
    error.forEach((e) => {
      pushError(e);
    });
  } else if (Array.isArray(error)) {
    const message = error.reduce((msg, e) => {
      if (typeof e.message === 'string') return `${msg}<br>${e.message}`;
      return msg;
    }, '');
    pushError(new Error(message, { cause: error }));
  } else {
    pushError(error);
  }
}
export function dismissAlert(index) {
  store.splice(index, 1);
}
