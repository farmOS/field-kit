import { reactive, readonly } from 'vue';

const store = reactive([]);
const reference = readonly(store);

export { reference as default };

function pushError(error) {
  if (process.env.NODE_ENV === 'development') {
    const origError = error.cause instanceof Error ? error.cause : error;
    // eslint-disable-next-line no-console
    console.error(origError);
  }
  store.push(error);
}

export function alert(error, options = {}) {
  if (Array.isArray(error) && options.concat === false) {
    error.forEach((e) => {
      pushError(e);
    });
  } else if (Array.isArray(error) && error.length > 0) {
    const message = error.reduce((msg, e) => {
      if (typeof e.message === 'string') {
        return `${msg}${e.message}<br>`;
      }
      return msg;
    }, '');
    pushError(new Error(message, { cause: error }));
  } else if (error instanceof Error) {
    pushError(error);
  }
}
export function dismissAlert(index) {
  store.splice(index, 1);
}
