import farmOS from "farmos";

let host = localStorage.getItem("host");
const getToken = () => JSON.parse(localStorage.getItem("token"));
const setToken = token => localStorage.setItem("token", JSON.stringify(token));
let client = farmOS(host, { clientId: 'farm_client', getToken, setToken });

const farm = () => {
    return client;
}

export const setHost = _host => {
  host = _host;
  client = farmOS(host, {
    clientId: 'farm_client',
    getToken,
    setToken
  });
};

export default farm;