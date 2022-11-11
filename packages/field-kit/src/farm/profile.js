import { reactive, readonly } from 'vue';
import farm from '.';
import { fetchEntities } from '../http/sync';

const LS = window.localStorage;

const init = () => ({
  farm: {
    name: '',
    url: '',
    version: '',
    system_of_measurement: '',
  },
  user: {
    id: '',
    display_name: '',
    langcode: 'en',
  },
});

const store = reactive(init());
const reference = readonly(store);

export { reference as default };

export const setProfile = (profile = { farm: {}, user: {} }) => {
  store.farm = {
    ...store.farm,
    ...profile.farm,
  };
  store.user = {
    ...store.user,
    ...profile.user,
  };
};

export function loadProfile() {
  const profile = JSON.parse(LS.getItem('profile'));
  if (profile) {
    setProfile(profile);
    return Promise.resolve(reference);
  }
  return Promise.reject(new Error('No profile stored, login required.'));
}

export function updateProfile() {
  return farm.remote.info()
    .then((info) => {
      const farmInfo = info.data?.meta?.farm;
      const user = info.data?.meta?.links?.me?.meta;
      if (farmInfo && user) {
        setProfile({ farm: farmInfo, user });
        return fetchEntities('user', { filter: { type: 'user', id: user.id } });
      }
      return Promise.reject(new Error('Cannot find remote profile info.'));
    })
    .then((results) => {
      if (results.data.length > 0) {
        const { attributes: { display_name, langcode } } = results.data[0];
        setProfile({ user: { display_name, langcode } });
        LS.setItem('profile', JSON.stringify(store));
      }
      return reference;
    });
}
