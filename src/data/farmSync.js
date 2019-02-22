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
        return request('/taxonomy_vocabulary.json').then(res => (
          request(`/taxonomy_term.json?vocabulary=${areaVid(res)}${params(id)}`, { method: 'DELETE', token })
        ));
      },
      get(opts = {}) {
        return request('/taxonomy_vocabulary.json').then((res) => {
          // If an ID # is passed instead of an options object
          if (typeof opts === 'number') {
            return request(`/taxonomy_term.json?vocabulary=${areaVid(res)}&tid=${opts}`);
          }

          // If an option object is passed, set defaults and parse the string params
          const { page = null, type = '' } = opts;
          const typeParams = (type !== '') ? `field_farm_area_type=${type}` : '';
          const pageParams = (page !== null) ? `page=${page}` : '';

          // If no page # is passed, get all of them
          if (page === null) {
            return requestAll(`/taxonomy_term.json?vocabulary=${areaVid(res)}&${typeParams}`);
          }

          // If no ID is passed but page is passed
          return request(`/taxonomy_term.json?vocabulary=${areaVid(res)}&${typeParams}&${pageParams}`);
        });
      },
      send(payload, id, token) {
        return request('/taxonomy_vocabulary.json').then(res => (
          request(`/taxonomy_term.json?vocabulary=${areaVid(res)}${params(id)}`, { method: 'POST', payload, token })
        ));
      },
    },
    asset: {
      delete(id, token) {
        return request(`/farm_asset/${id}.json`, { method: 'DELETE', token });
      },
      get(opts = {}) {
        // If an ID # is passed instead of an options object
        if (typeof opts === 'number') {
          return request(`/farm_asset/${opts}.json`);
        }

        // If an option object is passed, set defaults and parse the string params
        const {
          type = '',
          archived = false,
          page = null,
        } = opts;
        const typeParams = (type !== '') ? `type=${type}` : '';
        const archiveParams = (archived) ? '' : '&archived=0';
        const pageParams = (page !== null) ? `&page=${page}` : '';

        // If no page # is passed, get all of them
        if (page === null) {
          return requestAll(`/farm_asset.json?${typeParams}${archiveParams}`);
        }

        // If no ID is passed but page is passed
        return request(`/farm_asset.json?${typeParams}${archiveParams}${pageParams}`);
      },
      send(payload, id, token) {
        return request(`/farm_asset${params(id)}`, { method: 'POST', payload, token });
      },
    },
    info() {
      // Returns a json with {name: , url: , user: {uid: , name: , mail: }}
      return request('/farm.json');
    },
    log: {
      delete(id, token) {
        return request(`/log/${id}.json`, { method: 'DELETE', token });
      },
      get(opts = {}) {
        // Get log syntax already exists.  Lets test it!
        // If an ID # is passed instead of an options object
        if (typeof opts === 'number') {
          return request(`/log/${opts}.json`);
        }

        console.log("GETTING LOGS WITH THE FOLLOWING ", opts);

// More params to draw on:
// const {
//  active = true,
//  email = '',
//  name = '',
//  uid = null,
// } = opts;

// const activeParams = (active) ? 'status=1' : '';
// const emailParams = (email !== '') ? `&mail=${email}` : '';
// const nameParams = (name !== '') ? `&name=${name}` : '';
// const uidParams = (uid !== null) ? `&uid=${uid}` : '';

        // If an option object is passed, set defaults and parse the string params
        const { page = null, type = '' } = opts;
        const typeParams = (type !== '') ? `type=${type}` : '';
        const pageParams = (page !== null) ? `page=${page}` : '';

        // If no page # is passed, get all of them
        if (page === null) {
          return requestAll(`/log.json?${typeParams}`);
        }

        // If no ID is passed but page is passed
        return request(`/log.json?${typeParams}&${pageParams}`);
      },
      send(payload, token) {
        return request('/log', { method: 'POST', payload, token });
      },
    },
  };
}
