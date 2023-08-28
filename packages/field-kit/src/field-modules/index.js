import { reactive, readonly } from 'vue';
import { compose, map, path } from 'ramda';
import { FM_API_ENDPOINT, kebab } from '@farmos.org/field-scripts';
import farm from '../farm';
import { alert } from '../warnings/alert';
import importFieldModule from './import';
import upsert from '../utils/upsert';

const store = reactive([]);
const reference = readonly(store);

export { reference as default };

export function upsertModuleConfig(config) {
  upsert(store, 'name', config);
}

const LS = window.localStorage;

const transformModuleData = (data) => {
  const { id, attributes } = data;
  const {
    drupal_internal__id, status, label, description,
  } = attributes;
  const name = kebab(drupal_internal__id);
  return ({
    id, name, status, label, description,
  });
};
const transformModuleResponse = compose(
  map(transformModuleData),
  path(['data', 'data']),
);

function fetchFieldModules() {
  return farm.remote.request(`/${FM_API_ENDPOINT}`)
    .then(transformModuleResponse);
}

const partitionResults = (sources, results) =>
  results.reduce(([fulfilled, rejected], result, i) => {
    if (result.status === 'fulfilled') {
      const ful = [...fulfilled, sources[i]];
      return [ful, rejected];
    }
    const rej = [sources[i], ...rejected];
    return [fulfilled, rej];
  }, [[], []]);

const setFieldModules = mods => (results) => {
  const [fulfilled, rejected] = partitionResults(mods, results);
  store.forEach((mod, i) => {
    if (!fulfilled.some(m => mod.name === m.name)) {
      store.splice(i, 1);
    }
  });
  rejected.forEach(({ label, uri }) => {
    const error = new Error(`Error installing ${label} module from ${uri}.`);
    alert(error);
  });
  return fulfilled;
};

const importAllModules = mods => Promise.allSettled(mods.map(importFieldModule));

export function loadFieldModules() {
  const mods = JSON.parse(LS.getItem('modules')) || [];
  return importAllModules(mods).then(setFieldModules(mods));
}

export function updateFieldModules() {
  return fetchFieldModules().then((mods) => {
    LS.setItem('modules', JSON.stringify(mods));
    return importAllModules(mods).then(setFieldModules(mods));
  });
}
