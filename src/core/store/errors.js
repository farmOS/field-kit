import { reactive, readonly } from 'vue';
import router from '../router';
import { authInterceptor } from '../http/auth';

const store = reactive([]);
const reference = readonly(store);

export { reference as default };

export function alert(error) {
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV === 'development') console.error(error);
  store.push(authInterceptor(error, router));
}
export function dismissAlert(index) {
  store.splice(index, 1);
}
