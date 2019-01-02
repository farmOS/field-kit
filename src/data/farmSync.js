export default function (host, user, password) {
  function request(endpoint, {
    method = 'GET',
    payload = '',
    token = '',
    auth = false,
  } = {}) {
    const url = host + endpoint;
    // Set basic fetch options, for a non-auth GET requests
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'json',
      },
      credentials: 'include',
    };
    // Fetch options for non-auth POST requests
    if (method === 'POST' && !auth) {
      opts.headers['X-CSRF-Token'] = token;
      opts.body = JSON.stringify(payload);
    }
    // Fetch options for authentication GET requests
    if (auth) {
      opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    // Fetch options for authentication POST requests
    // TODO: Generalize this to work with any form request
    if (method === 'POST' && auth) {
      opts.body = `name=${payload.name}&pass=${payload.pass}&form_id=${payload.form_id}`; // eslint-disable-line camelcase
    }
    return new Promise((resolve, reject) => {
      fetch(url, opts).then((response) => {
        if (!response.ok) {
          throw response;
        }
        // If auth req, get token as a text response
        if (auth) {
          return response.text();
        }
        return response.json();
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
      return request('/user/login', { method: 'POST', payload, auth: true })
        .then(() => request('/restws/session/token', { auth: true })
          .then(token => token)
          .catch((error) => { throw error; }))
        .catch((error) => { throw error; });
    },
    area: {
      delete(id, token) {
        return request('taxonomy_vocabulary.json').then(res => (
          request(`taxonomy_term.json?vocabulary=${areaVid(res)}${params(id)}`, { method: 'DELETE', token })
        ));
      },
      get(id) {
        return request('taxonomy_vocabulary.json').then(res => (
          request(`taxonomy_term.json?vocabulary=${areaVid(res)}${params(id)}`)
        ));
      },
      send(payload, id, token) {
        return request('taxonomy_vocabulary.json').then(res => (
          request(`taxonomy_term.json?vocabulary=${areaVid(res)}${params(id)}`, { method: 'POST', payload, token })
        ));
      },
    },
    asset: {
      delete(id, token) {
        return request(`/farm_asset/${id}.json`, { method: 'DELETE', token });
      },
      get(id) {
        return request(`/farm_asset${params(id)}`);
      },
      send(payload, id, token) {
        return request(`/farm_asset${params(id)}`, { method: 'POST', payload, token });
      },
    },
    log: {
      delete(id, token) {
        return request(`/log/${id}.json`, { method: 'DELETE', token });
      },
      get(id) {
        return request(`/log${params(id)}`);
      },
      send(payload, token) {
        return request('/log', { method: 'POST', payload, token });
      },
    },
  };
}
