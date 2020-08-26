import {
  compose, allPass, map, anyPass,
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
);

const filterByLocalID = localIDs => log => localIDs.includes(log.localID);

const filterBySyncStatus = enabled => log => (enabled ? !log.wasPushedToServer : false);

const filterByTimestamp = range => (log) => {
  if (!range || range.length < 1) { return false; }
  const timestamp = log.timestamp.data !== undefined
    ? log.timestamp.data
    : log.timestamp;
  const start = range[0] || 0;
  const end = range[1] || Infinity;
  return start <= timestamp && timestamp <= end;
};

const createQuery = (filters, pass = {}) => {
  const { localIDs, unsynced, timestamp } = pass;
  const predicates = []
    .concat(filters ? filterByFilters(filters) : [])
    .concat(localIDs ? filterByLocalID(localIDs) : [])
    .concat(unsynced !== undefined ? filterBySyncStatus(unsynced) : [])
    .concat(timestamp ? filterByTimestamp(timestamp) : []);
  return anyPass(predicates);
};

export default createQuery;
