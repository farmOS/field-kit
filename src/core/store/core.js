import {
  clientId, setHost, getToken, setToken,
} from '../remote';
import farm from '../farm';

const initState = {
  mapboxAPIKey: '',
  areaGeoJSON: {
    type: 'FeatureCollection',
    features: [],
  },
};

export default {
  state: initState,
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
