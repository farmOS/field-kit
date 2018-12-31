export default function (host, user, password) {
  function request(endpoint, method = 'GET', payload = '', token = '') {
    const url = host + endpoint;
    let opts;
    if (method === 'GET') {
      opts = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'json',
        },
        credentials: 'include',
      };
    } else {
      opts = {
        method,
        headers: {
          'X-CSRF-Token': token,
          'Content-Type': 'application/json',
          Accept: 'json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      };
    }
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

  function authRequest(endpoint, method = 'GET', { form_id, name, pass } = {}) {
    const url = host + endpoint;
    const payload = 'name=' + name + '&pass=' + pass + '&form_id=' + form_id
    let opts;
    if (method === 'GET') {
      opts = {
        method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'json',
        },
        credentials: 'include',
      };
    } else {
      opts = {
        method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'json',
        },
        credentials: 'include',
        body: payload,
      };
    }
    return new Promise((resolve, reject) => {
      fetch(url, opts).then((response) => {
        console.log('fetch response: ', response);
        if (!response.ok) {
          throw response;
        }
        return response.text();
      }).then(resolve).catch(reject);
    });
  }

  // Utility for parsing if there's an ID provided, then formatting the params
  const params = id => (id ? `/${id}.json` : '.json');

  // Utility for finding the vid of the farm_assets vocabulary
  const areaVid = vocab => vocab.list
    .find(voc => voc.machine_name === 'farm_areas')
    .vid;

  return {
    authenticate() {
      const payload = {
        form_id: 'user_login',
        name: user,
        pass: password,
      };
      return authRequest('/user/login', 'POST', payload)
        .then(() => authRequest('/restws/session/token'));
    },
    area: {
      delete(id, token) {
        return request('taxonomy_vocabulary.json').then(res => (
          request(`taxonomy_term.json?vocabulary=${areaVid(res)}${params(id)}`, 'DELETE', '', token)
        ));
      },
      get(id) {
        return request('taxonomy_vocabulary.json').then(res => (
          request(`taxonomy_term.json?vocabulary=${areaVid(res)}${params(id)}`)
        ));
      },
      send(payload, id, token) {
        return request('taxonomy_vocabulary.json').then(res => (
          request(`taxonomy_term.json?vocabulary=${areaVid(res)}${params(id)}`, 'POST', payload, token)
        ));
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
      send(payload, token) {
        return request('/log', 'POST', payload, token);
      },
    },
  };
}
