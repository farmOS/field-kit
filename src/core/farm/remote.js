export const clientId = 'fieldkit';
export const getHost = () => localStorage.getItem('host') || '';
export const setHost = (host) => { localStorage.setItem('host', host); };
export const getToken = () => JSON.parse(localStorage.getItem('token'));
export const setToken = token => localStorage.setItem('token', JSON.stringify(token));
