import farmOS from 'farmos';

export const getHost = () => localStorage.getItem('host');

const remote = {
  host: getHost() || '',
  clientId: 'fieldkit',
  getToken: () => JSON.parse(localStorage.getItem('token')),
  setToken: token => localStorage.setItem('token', JSON.stringify(token)),
};

const farm = farmOS({ remote });

export default farm;

export const setHost = (host) => {
  farm.remote.add({ host, ...remote });
  localStorage.setItem('host', host);
};
