import {
  allPass, anyPass, compose, evolve, map, none, pick, prop, reduce,
} from 'ramda';
import farm from '../farm';
import nomenclature from './nomenclature';
import {
  deleteRecord, getRecords, saveRecord,
} from '../idb';
import { cachingCriteria, evictionCriteria } from './criteria';
import upsert from '../utils/upsert';
import parseFilter from '../utils/parseFilter';
import databases from '../idb/databases';
import SyncError from './SyncError';

const cacheEntity = (name, criteria, entity) => {
  const { shortName } = nomenclature.entities[name];
  const meetsCachingCriteria = cachingCriteria(criteria)[name];
  if (meetsCachingCriteria(entity)) {
    const serialized = farm[shortName].serialize(entity);
    return saveRecord('entities', name, serialized);
  }
  return Promise.resolve(entity);
};

const flattenSerializedEntity = ({
  id, type, meta, attributes, relationships,
}) => ({
  id, type, meta, ...attributes, ...relationships,
});

const docsReducer = ([schemata, types], { key, config_entity, json_schema }) => {
  const _schemata = json_schema ? { ...schemata, [key]: json_schema } : schemata;
  const _types = config_entity ? { ...types, [key]: config_entity } : types;
  return [_schemata, _types];
};
const partitionConfigDocs = reduce(docsReducer, [{}, {}]);
const configTypes = ['asset', 'log', 'quantity'];
const configTypesState = configTypes.reduce((types, name) => ({
  ...types,
  [`${name}Types`]: [],
}), {});
const requestConfigEntity = name =>
  farm.remote.request(`/api/${name}_type/${name}_type`).then(prop('data'));
const requestConfigDocs = () => Promise.all([
  farm.schema.fetch(),
  ...configTypes.map(requestConfigEntity),
]).then(([schemata, ...configResponses]) => {
  const configEntities = configResponses.reduce((ents, { data }, i) => ({
    ...ents,
    [configTypes[i]]: data,
  }), {});
  return [schemata, configEntities];
});

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
    ...configTypesState,
  },
  mutations: {
    upsertEntity(state, { shortPlural, entity }) {
      upsert(state[shortPlural], 'id', entity);
    },
    filterEntities(state, { shortPlural, predicate }) {
      state[shortPlural] = state[shortPlural].filter(predicate);
    },
    updateEntity(state, payload) {
      const { shortPlural, index, props } = payload;
      const ent = state[shortPlural][index];
      Object.entries(props).forEach(([key, val]) => {
        if (key in ent && ent[key] !== val) {
          ent[key] = val;
        }
      });
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
    setConfigTypes(state, { name, types }) {
      state[`${name}Types`] = types;
    },
  },
  actions: {
    loadConfigDocs({ commit }) {
      const dbRequests = Object.keys(nomenclature.entities)
        .map(name => getRecords('config_documents', name, d => d.enabled)
          .then((docs) => {
            const [schemata, configEntities] = partitionConfigDocs(docs);
            farm.schema.set(name, schemata);
            const types = map(pick(['label', 'name_pattern']), configEntities);
            commit('setConfigTypes', { name, types });
            return docs;
          }));
      return Promise.all(dbRequests);
    },
    updateConfigDocs({ commit }) {
      return requestConfigDocs().then(([schemata, configEntities]) => {
        farm.schema.set(schemata);
        return databases.config_documents.stores.map(({ name }) => {
          const docs = Object.entries(schemata[name] || {}).map(([key, json_schema]) => ({
            key, json_schema, config_entity: null, enabled: true,
          }));
          if (name in configEntities) {
            const types = {};
            configEntities[name].forEach((config_entity) => {
              const {
                attributes: { drupal_internal__id: key, label, name_pattern },
              } = config_entity;
              types[key] = { label, name_pattern };
              const doc = docs.find(d => d.key === key);
              if (doc) {
                doc.config_entity = config_entity;
              } else {
                docs.push({
                  key, config_entity, json_schema: null, enabled: true,
                });
              }
            });
            commit('setConfigTypes', { name, types });
          }
          const enableRequest = Promise.all(docs.map(doc =>
            saveRecord('config_documents', name, doc)));
          const disableRequest = getRecords('config_documents', name, doc =>
            none(d => d.key === doc.key, docs));
          return Promise.all([enableRequest, disableRequest])
            .then(([enabled, disabled]) => ({ name, enabled, disabled }));
        });
      });
    },
    purgeEntities({ state }) {
      const now = Date.now();
      const uid = state.profile.user.id;
      const criteria = evictionCriteria({ now, uid });
      const query = map(fn => compose(fn, flattenSerializedEntity), criteria);
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
      commit('updateEntity', { shortPlural, props, index });
      const entity = state[shortPlural][index];
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
      const { shortName, shortPlural } = nomenclature.entities[name];
      const predicate = parseFilterWithOptions(filter, options);
      commit('filterEntities', { shortPlural, predicate });
      const query = compose(predicate, flattenSerializedEntity);
      return getRecords('entities', name, query).then((results) => {
        const data = results.map((r) => {
          const entity = farm[shortName].deserialize(r);
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
            let local = state[shortPlural].find(ent => ent.id === remote.id);
            if (local) {
              farm[shortName].merge(local, remote);
            } else {
              const meta = m => ({ remote: { lastSync: now, meta: m } });
              const serialized = evolve({ meta }, remote);
              local = farm[shortName].deserialize(serialized);
            }
            commit('upsertEntity', { shortPlural, entity: local });
            cacheEntity(name, criteria, local);
          });
          return errorInterceptor(results);
        });
    },
    syncEntities({ commit, dispatch, state }, { name, filter, options }) {
      const { shortName, shortPlural } = nomenclature.entities[name];
      const now = Date.now();
      const criteria = { now, uid: state.profile.user.id };
      const handleSendResults = reduce((results, { status, reason, value }) => {
        const { fulfilled, rejected } = results;
        if (status === 'rejected') {
          return {
            ...results,
            rejected: [...rejected, reason],
          };
        }
        const { data: remote } = value;
        const local = state[shortPlural].find(ent => ent.id === remote.id);
        farm[shortName].merge(local, remote);
        farm.meta.setLastSync(local, now);
        commit('upsertEntity', { shortPlural, local });
        cacheEntity(name, criteria, local);
        upsert(results.data, 'id', remote);
        return {
          ...results,
          fulfilled: [...fulfilled, value],
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
            .filter(predicate)
            .map(farm[shortName].serialize);
          const requests = entities.map(farm[shortName].send);
          return Promise.allSettled(requests)
            .then(handleSendResults(fetchResults));
        }).then(errorInterceptor);
    },
  },
};
