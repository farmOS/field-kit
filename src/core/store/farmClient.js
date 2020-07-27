import farmOS from 'farmos';

// For pre-0.5.0 versions, make sure there's not a CSRF token left in localStorage.
try {
  const token = JSON.parse(localStorage.getItem('token'));
  if (typeof token !== 'object' && token !== null) {
    throw new Error('Invalid token in localStorage.');
  }
} catch (e) {
  localStorage.removeItem('token');
}

let host = localStorage.getItem('host');
const getToken = () => JSON.parse(localStorage.getItem('token'));
const setToken = token => localStorage.setItem('token', JSON.stringify(token));
let client = farmOS(host, { clientId: 'farm_client', getToken, setToken });

const farm = () => client;

export const setHost = (_host) => {
  host = _host;
  client = farmOS(host, {
    clientId: 'farm_client',
    getToken,
    setToken,
  });
};

export default farm;
