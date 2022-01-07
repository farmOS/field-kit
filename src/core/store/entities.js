import Vue from 'vue';
import { anyPass } from 'ramda';
import farm from '../farm';
import nomenclature from './nomenclature';
import { deleteRecord, getRecords } from '../idb';
import { cacheEntity } from '../idb/cache';
import SyncError from '../http/SyncError';
import upsert from '../utils/upsert';
import parseFilter from '../utils/parseFilter';
import { fetchEntities, syncEntities } from '../http/sync';

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
      state[shortPlural] = state[shortPlural].filter(predicate);
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
    createEntity({ commit, state }, { name, props }) {
      const { shortName, shortPlural } = nomenclature.entities[name];
      const entity = farm[shortName].create(props);
      commit('upsertEntity', { shortPlural, entity });
      const criteria = {
        now: Date.now(),
        uid: state.profile.user.id,
      };
      return cacheEntity(name, entity, criteria);
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
      return cacheEntity(name, entity, criteria);
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
      return getRecords('entities', name, predicate).then((results) => {
        const data = results.map((entity) => {
          commit('upsertEntity', { shortPlural, entity });
          return entity;
        });
        return { data, fulfilled: results, rejected: [] };
      }).catch((e) => {
        throw new Error({ data: [], fulfilled: [], rejected: [e] });
      });
    },
    fetchEntities({ commit, dispatch, state }, payload) {
      const {
        name, filter, limit = Infinity, options,
      } = payload;
      const { shortName, shortPlural } = nomenclature.entities[name];
      const now = new Date().toISOString();
      const criteria = { now, uid: state.profile.user.id };
      return dispatch('loadEntities', { name, filter, options })
        .then(({ data }) => fetchEntities(shortName, { cache: data, filter, limit }))
        .then((results) => {
          results.data.forEach((entity) => {
            commit('upsertEntity', { shortPlural, entity });
            cacheEntity(name, entity, criteria);
          });
          return errorInterceptor(results);
        });
    },
    syncEntities({ commit, dispatch, state }, payload) {
      const {
        name, filter, limit = Infinity, options,
      } = payload;
      const { shortName, shortPlural } = nomenclature.entities[name];
      const now = new Date().toISOString();
      const criteria = { now, uid: state.profile.user.id };
      return dispatch('loadEntities', { name, filter, options })
        .then(({ data }) => syncEntities(shortName, { cache: data, filter, limit }))
        .then((results) => {
          results.data.forEach((entity) => {
            commit('upsertEntity', { shortPlural, entity });
            cacheEntity(name, entity, criteria);
          });
          return errorInterceptor(results);
        });
    },
  },
};
