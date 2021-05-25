/* eslint-disable no-use-before-define */
import {
  compose, allPass, map, prop, anyPass, T,
} from 'ramda';

const logicOperators = {
  $and: bound => allPass(map(parseFilter, bound)),
  $or: bound => anyPass(map(parseFilter, bound)),
};

const comparisonOperators = {
  $eq: bound => data => data === bound,
  $ne: bound => data => data !== bound,
  $gt: bound => data => data > bound,
  $gte: bound => data => data >= bound,
  $lt: bound => data => data < bound,
  $lte: bound => data => data <= bound,
};

function parseField([key, value]) {
  if (key in comparisonOperators) {
    return comparisonOperators[key](value);
  }
  let predicate = T;
  if (['string', 'number', 'boolean'].includes(typeof value) || !value) {
    predicate = comparisonOperators.$eq(value);
  }
  if (Array.isArray(value)) {
    predicate = logicOperators.$or(value);
  }
  if (typeof value === 'object') {
    predicate = parseFilter(value);
  }
  return compose(predicate, prop(key));
}

export default function parseFilter(filter = {}) {
  if (Array.isArray(filter)) {
    return logicOperators.$or(filter);
  }
  const entries = Object.entries(filter);
  if (entries.length === 0) {
    return T;
  }
  const [key, val] = entries[0] || [];
  if (key in logicOperators && Array.isArray(val)) {
    const predicate = logicOperators[key](val);
    return predicate;
  }
  return allPass(map(parseField, entries));
}
