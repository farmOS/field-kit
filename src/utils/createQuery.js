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

const createQuery = (filters = {}, localIDs = []) => anyPass([
  filterByFilters(filters),
  filterByLocalID(localIDs),
]);

export default createQuery;
