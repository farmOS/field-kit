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

  // Recursive request for looping through multiple pages
  function requestAll(url, page = 0, list = []) {
    return new Promise((resolve, reject) => request(`${url}&page=${page}`)
      .then((response) => {
        const lastPage = +(new URL(response.last)).searchParams.get('page');
        if (page === lastPage) {
          console.log(`Requesting last page, ${page}`);
          resolve(list.concat(response.list));
          return;
        }
        console.log(`Requesting page ${page}, ${lastPage - page} more to go.`);
        const newList = list.concat(response.list);
        requestAll(url, page + 1, newList).then(resolve).catch(reject);
      }).catch(reject));
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
      get(opts = {}) {
        // If an ID # is passed instead of an options object
        if (typeof opts === 'number') {
          return request(`/log/${opts}.json`);
        }
        const { page = null, type = '' } = opts;
        const typeParams = (type !== '') ? `type=${type}` : '';
        const pageParams = (page !== null) ? `page=${page}` : '';

        // If no page # is passed, get all of them
        if (page === null) {
          return requestAll(`/log.json?${typeParams}`);
        }

        // If no ID is passed but page is passed
        return request(`/log.json?${typeParams}&${pageParams}`).then((res) => {
          console.log('This is the only page.');
          return res;
        });
      },
      send(payload, token) {
        return request('/log', { method: 'POST', payload, token });
      },
    },
  };
}
