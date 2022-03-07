import {
  clientId, setHost, getToken, setToken,
} from '../remote';
import farm from '../farm';
import router from '../router';
import { authInterceptor } from '../http/auth';

const initState = {
  errors: [],
  mapboxAPIKey: '',
  areaGeoJSON: {
    type: 'FeatureCollection',
    features: [],
  },
};

export default {
  state: initState,
  mutations: {
    alert(state, error) {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development') console.error(error);
      state.errors.push(authInterceptor(error, router));
    },
    dismissAlert(state, index) {
      state.errors.splice(index, 1);
    },
  },
  actions: {
    authorize(_, { host, username, password }) {
      const remote = {
        host, clientId, getToken, setToken,
      };
      setHost(host);
      farm.remote.add(remote);
      return farm.remote.authorize(username, password);
    },
  },
};
