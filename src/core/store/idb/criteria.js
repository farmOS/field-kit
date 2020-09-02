import {
  anyPass, allPass, complement, compose,
} from 'ramda';
import { isUnsynced } from '../../../utils/farmLog';
import { useData } from '../../../utils/createQuery';

const tMinus = (t, x) => t - (60 * 60 * 24 * x);
const tPlus = (t, x) => t + (60 * 60 * 24 * x);

const isFromLast30Days = current => compose(
  ts => ts > tMinus(current, 30) && ts <= current,
  useData('timestamp'),
);
const isInNext15Days = current => compose(
  ts => ts >= current && ts < tPlus(current, 15),
  useData('timestamp'),
);

export const cachingCriteria = current => anyPass([
  isFromLast30Days(current),
  isInNext15Days(current),
  isUnsynced,
]);

export const evictionCriteria = current => allPass([
  complement(isFromLast30Days(current)),
  complement(isInNext15Days(current)),
  complement(isUnsynced),
]);
