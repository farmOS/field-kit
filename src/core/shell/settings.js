import { reactive, readonly } from 'vue';

const init = () => ({
  permissions: {
    geolocation: true,
  },
});

const store = reactive(init());
const reference = readonly(store);

export { reference as default };
