/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export function initializeLog ({ commit, dispatch }, initProps = {}) {
      return new Promise((resolve, reject) => {
        dispatch('generateLogID').then((localID) => {
          // If the log is coming from the server, it will already have an id
          // and all its properties, so only needs to be updated w/ localID.
          const newLog = createLog({ ...initProps, localID });
          commit('addLogs', newLog);
          resolve(localID);
        }).catch(reject);
      });
}

export function loadLogs({ commit, dispatch }, { filter, pass }) {
      const query = createQuery(filter, pass);
      commit('filterLogs', query);
      return dispatch('loadCachedLogs', query);
}

export function getLogs(context, payload) {
      return context.dispatch('loadCachedLogs', payload)
        .then(() => getRemoteLogs(context, payload));
}

export function syncLogs(context, payload) {
      return context.dispatch('loadCachedLogs', payload)
        .then(() => getRemoteLogs(context, payload))
        .then(() => sendRemoteLogs(context, payload));
}

export function updateFarmResources({ commit, dispatch }, response) {
      const replaceResources = (res) => {
        if (res.resources) {
          commit('setFarmResources', res.resources);
          dispatch('cacheFarmResources', res.resources);
        }
        return res;
      };
      if (response) {
        return replaceResources(response);
      }
      return checkHost()
        .then(() => farm().info())
        .then(replaceResources);
    }

export function updateAreas({ commit }) {
      return checkHost()
        .then(() => farm().area.get())
        .then((res) => {
          // If a successful response is received, delete and replace all areas
          commit('deleteAllAreas');
          const areas = res.list.map(({ tid, name, geofield }) => ({ tid, name, geofield }));
          commit('addAreas', areas);
        });
    }

export function updateAssets({ commit }) {
      return checkHost()
        .then(() => farm().asset.get())
        .then((res) => {
          // If a successful response is received, delete and replace all assets
          commit('deleteAllAssets');
          commit('addAssets', res.list);
        });
    }

export function updateUnits({ commit }) {
      // Return units only.
      return checkHost()
        .then(() => farm().term.get('farm_quantity_units'))
        .then((res) => {
          commit('deleteAllUnits');
          const units = res.list.map(({ tid, name }) => ({ tid, name }));
          commit('addUnits', units);
        });
    }

export function updateCategories({ commit }) {
      // Return categories only.
      return checkHost()
        .then(() => farm().term.get('farm_log_categories'))
        .then((res) => {
          commit('deleteAllCategories');
          const cats = res.list.map(({ tid, name }) => ({ tid, name }));
          commit('addCategories', cats);
        });
}
