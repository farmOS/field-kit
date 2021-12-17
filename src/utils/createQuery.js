/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  compose, allPass, map, anyPass, dissoc, ifElse, hasPath, path, prop,
} from 'ramda';
import { isUnsynced } from './farmLog';

export const useData = key => ifElse(
  hasPath([key, 'data']),
  path([key, 'data']),
  prop(key),
);

const filterByKeyValue = ([key, val]) => (log) => {
  const data = useData(key)(log);
  if (Array.isArray(val)) {
    if (Array.isArray(data)) {
      return val.some(v => data.some(d => +d.id === +v));
    }
    return val.includes(data);
  }
  if (Array.isArray(data)) {
    return data.some(d => +d.id === +val);
  }
  return data === val;
};

const filterByFilters = compose(
  allPass,
  map(filterByKeyValue),
  Object.entries,
  dissoc('timestamp'),
);

const filterByLocalID = localIDs => log => localIDs.includes(log.localID);

const filterBySyncStatus = enabled => log =>
  enabled && isUnsynced(log);

export const filterByTimestamp = ([start = 0, end = Infinity]) =>
  compose(
    ts => start <= ts && ts <= end,
    useData('timestamp'),
  );

const filterByTimestampAndFilters = (filters) => {
  const { timestamp: range } = filters;
  if (!range) {
    return filterByFilters(filters);
  }
  if (range.length < 1) {
    return compose(
      filterByFilters,
      dissoc('timestamp'),
    )(filters);
  }
  return allPass([
    filterByFilters(filters),
    filterByTimestamp(range),
  ]);
};

const createQuery = (filters, pass = {}) => {
  const { localIDs, unsynced, timestamp } = pass;
  const predicates = []
    .concat(filters ? filterByTimestampAndFilters(filters) : [])
    .concat(localIDs ? filterByLocalID(localIDs) : [])
    .concat(unsynced !== undefined ? filterBySyncStatus(unsynced) : [])
    .concat(timestamp ? filterByTimestamp(timestamp) : []);
  return anyPass(predicates);
};

export default createQuery;
