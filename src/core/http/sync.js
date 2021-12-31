import { allPass, insert } from 'ramda';
import farm from '../farm';
import parseFilter from '../utils/parseFilter';

const syncEntity = (shortName, { cache = [], filter, limit = Infinity }) =>
  farm[shortName].fetch({ filter, limit }).then((fetchResults) => {
    const mergedResults = fetchResults.data.reduce((collection, remote) => {
      const i = collection.findIndex(ent => ent.id === remote.id);
      const merged = farm[shortName].merge(collection[i], remote);
      return insert(i, merged, collection);
    }, cache);
    const failedBundles = fetchResults.rejected.map(({ response = {} }) => {
      const { config: { url } } = response;
      const bundleName = url.split('?')[0].split('/').pop();
      return bundleName;
    });
    const predicate = allPass([
      parseFilter(filter),
      entity => failedBundles.every(b => b !== entity.type),
      farm.meta.isUnsynced,
    ]);
    const syncables = mergedResults.filter(predicate);
    const sendRequests = syncables.map(farm[shortName].send);
    return Promise.allSettled(sendRequests)
      .then(sendResults => sendResults.reduce((result, { status, reason, value: remote }) => {
        const { data, fulfilled, rejected } = result;
        if (status === 'rejected') {
          return {
            ...result,
            rejected: [...rejected, reason],
          };
        }
        const i = syncables.findIndex(ent => ent.id === remote.id);
        const merged = farm[shortName].merge(syncables[i], remote);
        return {
          data: insert(i, merged, data),
          fulfilled: [...fulfilled, remote],
        };
      }, fetchResults));
  });

export default syncEntity;
