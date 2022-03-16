/**
 * CONFIG DOCUMENTS
 * farmOS 2.x (ie, Drupal 9) has a few different ways of creating entities, one
 * of which is as a "config entity." This actually has some advantages, b/c it
 * provides additional configuration details over the API that is handy,
 * especially for logs. However, it makes the process of collecting and storing
 * those configuration details a lot more complicated. So here, we have the state
 * and logic for fetching, processing and storing all configuration data for a
 * particular entity, which we call its `config_documents`, all in one place.
 * For the time being, we're also adding types to the global store for config
 * entities only (assets, logs and quantities), but that could change.
 */
import { reactive, readonly } from 'vue';
import {
  map, none, pick, prop, reduce,
} from 'ramda';
import farm from '../farm';
import nomenclature from './nomenclature';
import databases from '../idb/databases';
import { getRecords, saveRecord } from '../idb';

const docsReducer = ([schemata, types], { key, config_entity, json_schema }) => {
  const _schemata = json_schema ? { ...schemata, [key]: json_schema } : schemata;
  const _types = config_entity ? { ...types, [key]: config_entity } : types;
  return [_schemata, _types];
};
const partitionConfigDocs = reduce(docsReducer, [{}, {}]);
const configTypes = ['asset', 'log', 'quantity'];
const configTypesState = configTypes.reduce((types, name) => ({
  ...types,
  [name]: [],
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

const store = reactive(configTypesState);
const reference = readonly(store);

export { reference as default };

export function setConfigTypes({ name, types }) {
  const { shortName } = nomenclature.entities[name];
  store[shortName] = types;
}

export function loadConfigDocs() {
  const dbRequests = Object.keys(nomenclature.entities)
    .map(name => getRecords('config_documents', name, d => d.enabled)
      .then((docs) => {
        const [schemata, configEntities] = partitionConfigDocs(docs);
        farm.schema.set(name, schemata);
        if (configTypes.includes(name)) {
          const types = map(pick(['label', 'name_pattern']), configEntities);
          setConfigTypes({ name, types });
        }
        return docs;
      }));
  return Promise.all(dbRequests);
}

export function updateConfigDocs() {
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
        setConfigTypes({ name, types });
      }
      const enableRequest = Promise.all(docs.map(doc =>
        saveRecord('config_documents', name, doc)));
      const disableRequest = getRecords('config_documents', name, doc =>
        none(d => d.key === doc.key, docs));
      return Promise.all([enableRequest, disableRequest])
        .then(([enabled, disabled]) => ({ name, enabled, disabled }));
    });
  });
}
