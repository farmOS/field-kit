import Vue from 'vue';
import {
  allPass, anyPass, compose, map, reduce,
} from 'ramda';
import farm from '../farm';
import nomenclature from './nomenclature';
import {
  deleteRecord, getRecords, saveRecord,
} from '../idb';
import { cachingCriteria, evictionCriteria } from './criteria';
import SyncError from './SyncError';
import upsert from '../utils/upsert';
import parseFilter from '../utils/parseFilter';
import flattenEntity from '../utils/flattenEntity';

const cacheEntity = (name, criteria, entity) => {
  const meetsCachingCriteria = cachingCriteria(criteria)[name];
  if (meetsCachingCriteria(entity)) {
    return saveRecord('entities', name, entity);
  }
  return Promise.resolve(entity);
};

function parseFilterWithOptions(filter, options = {}) {
  const predicates = [parseFilter(filter)];
  if (options.includeUnsynced) predicates.push(farm.meta.isUnsynced);
  return anyPass(predicates);
}

const errorInterceptor = (results) => {
  if (results.rejected.length > 0) {
    throw new SyncError(results);
  }
  return results;
};

export default {
  state: {
    assets: [],
    logs: [],
    plans: [],
    quantities: [],
    terms: [],
    users: [],
  },
  mutations: {
    upsertEntity(state, { shortPlural, entity }) {
      upsert(state[shortPlural], 'id', entity);
    },
    filterEntities(state, { shortPlural, predicate }) {
      state[shortPlural] = state[shortPlural]
        .filter(compose(predicate, flattenEntity));
    },
    updateEntity(state, payload) {
      const { shortPlural, index, entity } = payload;
      Vue.set(state[shortPlural], index, entity);
    },
    deleteEntity(state, { shortPlural, id }) {
      const index = state[shortPlural].findIndex(ent => ent.id === id);
      state[shortPlural].splice(index, 1);
    },
    deleteAllEntities(state) {
      state.assets = [];
      state.logs = [];
      state.plans = [];
      state.quantities = [];
      state.terms = [];
      state.users = [];
    },
  },
  actions: {
    purgeEntities({ state }) {
      const now = Date.now();
      const uid = state.profile.user.id;
      const criteria = evictionCriteria({ now, uid });
      const query = map(fn => compose(fn, flattenEntity), criteria);
      const dbRequests = Object.keys(nomenclature.entities)
        .map(name => deleteRecord('entities', name, query[name]));
      return Promise.all(dbRequests);
    },
    createEntity({ commit, state }, { name, props }) {
      const { shortName, shortPlural } = nomenclature.entities[name];
      const entity = farm[shortName].create(props);
      commit('upsertEntity', { shortPlural, entity });
      const criteria = {
        now: Date.now(),
        uid: state.profile.user.id,
      };
      return cacheEntity(name, criteria, entity);
    },
    updateEntity({ commit, state }, { name, props: { id, ...props } }) {
      const { shortName, shortPlural } = nomenclature.entities[name];
      const index = state[shortPlural].findIndex(e => e.id === id);
      if (index < 0) {
        const error = new Error(`Cannot update ${shortName} without a valid id.`);
        return Promise.reject(error);
      }
      const orig = state[shortPlural][index];
      const entity = farm[shortName].update(orig, props);
      commit('updateEntity', { shortPlural, index, entity });
      const criteria = {
        now: Date.now(),
        uid: state.profile.user.id,
      };
      return cacheEntity(name, criteria, entity);
    },
    deleteEntity({ commit, state }, { name, id }) {
      const { shortName, shortPlural } = nomenclature.entities[name];
      const index = state[shortPlural].findIndex(e => e.id === id);
      if (index < 0) {
        const error = new Error(`Cannot delete ${shortName} without a valid id.`);
        return Promise.reject(error);
      }
      commit('deleteEntity', { shortPlural, index });
      return deleteRecord('entities', name, id);
    },
    loadEntities({ commit }, { name, filter, options }) {
      const { shortPlural } = nomenclature.entities[name];
      const predicate = parseFilterWithOptions(filter, options);
      commit('filterEntities', { shortPlural, predicate });
      const query = compose(predicate, flattenEntity);
      return getRecords('entities', name, query).then((results) => {
        const data = results.map((entity) => {
          commit('upsertEntity', { shortPlural, entity });
          return entity;
        });
        return { data, fulfilled: results, rejected: [] };
      }).catch((e) => {
        throw new Error({ data: [], fulfilled: [], rejected: [e] });
      });
    },
    fetchEntities({ commit, dispatch, state }, { name, filter, options }) {
      const { shortName, shortPlural } = nomenclature.entities[name];
      return dispatch('loadEntities', { name, filter, options })
        .then(() => farm[shortName].fetch({ filter }))
        .then((results) => {
          const now = new Date().toISOString();
          const criteria = { now, uid: state.profile.user.id };
          results.data.forEach((remote) => {
            const local = state[shortPlural].find(ent => ent.id === remote.id);
            const entity = farm[shortName].merge(local, remote);
            commit('upsertEntity', { shortPlural, entity });
            cacheEntity(name, criteria, entity);
          });
          return errorInterceptor(results);
        });
    },
    syncEntities({ commit, dispatch, state }, { name, filter, options }) {
      const { shortName, shortPlural } = nomenclature.entities[name];
      const now = Date.now();
      const criteria = { now, uid: state.profile.user.id };
      const handleSendResults = reduce((results, { status, reason, value: remote }) => {
        const { fulfilled, rejected } = results;
        if (status === 'rejected') {
          return {
            ...results,
            rejected: [...rejected, reason],
          };
        }
        const local = state[shortPlural].find(ent => ent.id === remote.id);
        const entity = farm[shortName].merge(local, remote);
        commit('upsertEntity', { shortPlural, entity });
        cacheEntity(name, criteria, entity);
        upsert(results.data, 'id', remote);
        return {
          ...results,
          fulfilled: [...fulfilled, remote],
        };
      });
      return dispatch('fetchEntities', { name, filter, options })
        .catch((e) => {
          if (e.fulfilled?.length > 0 && !e.loginRequired) {
            const { data, fulfilled, rejected } = e;
            return { data, fulfilled, rejected };
          }
          throw e;
        })
        .then((fetchResults) => {
          const failedBundles = fetchResults.rejected.map(({ response = {} }) => {
            const { config: { url } } = response;
            const bundle = url.split('?')[0].split('/').pop();
            return bundle;
          });
          const excludeFailedBundles = entity =>
            failedBundles.every(b => b !== entity.type);
          const predicate = allPass([
            parseFilterWithOptions(filter, options),
            excludeFailedBundles,
            farm.meta.isUnsynced,
          ]);
          const entities = state[shortPlural]
            .filter(compose(predicate, flattenEntity));
          const requests = entities.map(farm[shortName].send);
          return Promise.allSettled(requests)
            .then(handleSendResults(fetchResults));
        }).then(errorInterceptor);
    },
  },
};
