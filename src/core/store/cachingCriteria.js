import { anyPass, complement, evolve } from 'ramda';
import parseFilter from '../../utils/parseFilter';
import farm from '../farm';

// Exporting only for the sake of testing, at least for now.
export const daysAway = (t, x) => {
  const ms = new Date(t).valueOf() + (1000 * 60 * 60 * 24 * x);
  const iso = new Date(ms).toISOString();
  return iso;
};

const assetCriteria = anyPass([
  parseFilter({
    status: 'active',
  }),
  farm.meta.isUnsynced,
]);

const logCriteria = now => anyPass([
  parseFilter({
    timestamp: {
      $gt: daysAway(now, -30),
      $lt: daysAway(now, 15),
    },
  }),
  farm.meta.isUnsynced,
]);

export const cachingCriteria = now => ({
  asset: assetCriteria,
  log: logCriteria(now),
  plan: farm.meta.isUnsynced,
  quantity: farm.meta.isUnsynced,
  term: farm.meta.isUnsynced,
  user: farm.meta.isUnsynced,
});

export const evictionCriteria = now => evolve({
  asset: complement,
  log: complement,
  plan: complement,
  quantity: complement,
  term: complement,
  user: complement,
}, cachingCriteria(now));
