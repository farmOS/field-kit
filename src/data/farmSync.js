export default function (host, user, password) {
  function request(endpoint, method = 'GET', payload = '', token = '') {
    const url = host + endpoint;
    const requestHeaders = {
      'X-CSRF-Token': token,
      'Content-Type': 'application/json',
      Accept: 'json',
    };
    const opts = {
      method,
      headers: requestHeaders,
      credentials: 'include',
      body: JSON.stringify(payload),
    };
    return new Promise((resolve, reject) => {
      fetch(url, opts).then((response) => {
        console.log('fetch response: ', response);
        if (!response.ok) {
          throw response;
        }
        return response.json();
      }).then(resolve).catch(reject);
    });
  }

  // Utility function for parsing if there's an ID provided and formatting the params
  const params = id => (id ? `/${id}.json` : '.json');

  return {
    authenticate() {
      const payload = {
        form_id: 'user_login',
        name: user,
        pass: password,
      };
      return request('/user/login', 'POST', payload)
        .then(() => request('/restws/session/token'));
    },
    area: {
      delete(id, token) {
        request('taxonomy_vocabulary').then((res) => {
          const areaVid = res.list.find(voc => voc.machine_name === 'farm_areas').vid;
          return request(`taxonomy_term.json?vocabulary=${areaVid}${params(id)}`, 'DELETE', '', token);
        });
      },
      get(id) {
        request('taxonomy_vocabulary').then((res) => {
          const areaVid = res.list.find(voc => voc.machine_name === 'farm_areas').vid;
          return request(`taxonomy_term.json?vocabulary=${areaVid}${params(id)}`);
        });
      },
      send(payload, id, token) {
        request('taxonomy_vocabulary').then((res) => {
          const areaVid = res.list.find(voc => voc.machine_name === 'farm_areas').vid;
          return request(`taxonomy_term.json?vocabulary=${areaVid}${params(id)}`, 'POST', payload, token);
        });
      },
    },
    asset: {
      delete(id, token) {
        return request(`/farm_asset/${id}.json`, 'DELETE', '', token);
      },
      get(id) {
        return request(`/farm_asset${params(id)}`);
      },
      send(payload, id, token) {
        return request(`/farm_asset${params(id)}`, 'POST', payload, token);
      },
    },
    log: {
      delete(id, token) {
        return request(`/log/${id}.json`, 'DELETE', '', token);
      },
      get(id) {
        return request(`/log${params(id)}`);
      },
      send(payload, id, token) {
        return request(`/log${params(id)}`, 'POST', payload, token);
      },
    },
  };
}
