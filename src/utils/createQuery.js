import {
  compose, allPass, map, anyPass, dissoc,
} from 'ramda';

const filterByKeyValue = ([key, val]) => (log) => {
  const data = log[key].data !== undefined ? log[key].data : log[key];
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

const filterBySyncStatus = enabled => log => (enabled ? !log.wasPushedToServer : false);

export const filterByTimestamp = range => (log) => {
  const timestamp = log.timestamp.data !== undefined
    ? log.timestamp.data
    : log.timestamp;
  const start = range[0] || 0;
  const end = range[1] || Infinity;
  return start <= timestamp && timestamp <= end;
};

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
