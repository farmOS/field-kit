/* eslint-disable no-use-before-define */
import {
  allPass, any, anyPass, compose, equals, init, last, map, none, prop, T, when,
} from 'ramda';

const operators = {
  $and: compose(allPass, map(parseFilter)),
  $or: compose(anyPass, map(parseFilter)),
  $eq: bound => data => data === bound,
  $ne: bound => data => data !== bound,
  $gt: bound => data => data > bound,
  $gte: bound => data => data >= bound,
  $lt: bound => data => data < bound,
  $lte: bound => data => data <= bound,
  $in: compose(any, parseFilter),
  $nin: compose(none, parseFilter),
};

const isNumber = n => !Number.isNaN(+n);
const coerceKey = when(isNumber, n => +n);
const lastKey = compose(coerceKey, last);

function parsePath(path, value) {
  const key = lastKey(path);
  const rest = init(path);
  if (rest.length === 0) {
    return parseField([key, { $in: value }]);
  }
  return parsePath(rest, { [key]: value });
}

function parseField([key, value]) {
  if (key.includes('.')) {
    const path = key.split('.');
    return parsePath(path, value);
  }
  if (key in operators && value !== undefined) {
    return operators[key](value);
  }
  let predicate = T;
  if (['string', 'number', 'boolean'].includes(typeof value) || value === null) {
    predicate = operators.$eq(value);
  } else if (Array.isArray(value)) {
    predicate = operators.$or(value);
  } else if (typeof value === 'object') {
    predicate = parseFilter(value);
  }
  return compose(predicate, prop(key));
}

export default function parseFilter(filter = {}) {
  if (Array.isArray(filter)) {
    return operators.$or(filter);
  }
  if (typeof filter !== 'object') return equals(filter);
  const entries = Object.entries(filter);
  if (entries.length === 0) return T;
  return allPass(entries.map(parseField));
}
