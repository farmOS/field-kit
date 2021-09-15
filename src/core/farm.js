import farmOS from 'farmos';
import schemata from 'farmos/src/model/schemata/stub';

export const getHost = () => localStorage.getItem('host');

const remote = {
  options: {
    host: getHost(),
    clientId: 'farm_client',
    getToken: () => JSON.parse(localStorage.getItem('token')),
    setToken: token => localStorage.setItem('token', JSON.stringify(token)),
  },
};

const farm = farmOS({ schemata, remote });

export default farm;

export const setHost = (host) => {
  localStorage.setItem('host', host);
  farm.remote.setHost(host);
};
