import { anyPass, allPass, complement } from 'ramda';

const tMinus = (t, x) => t - (60 * 60 * 24 * x);
const tPlus = (t, x) => t + (60 * 60 * 24 * x);

const isFromLast30Days = current => log =>
  log.timestamp.data > tMinus(current, 30) && log.timestamp.data <= current;
const isInNext15Days = current => log =>
  log.timestamp.data >= current && log.timestamp.data < tPlus(current, 15);
const isUnsynced = log => !log.wasPushedToServer;

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
