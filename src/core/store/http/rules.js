/**
 * RULES
 * =====
 * All rules functions, which are similar to predicate functions, take a log
 * as their first parameter, and an optional dependencies object as their
 * second parameter. They return an object with two fields: syncable, a boolean
 * that determines whether there will be an attempt to sync the log; and reason,
 * a string containing the reason why it cannot be synced. The reason is not
 * required if the log is syncable. Dependendencies should be provided in
 * http/module.js, when the syncReducer is instantiated under the syncAllLogs
 * action.
 */

// Every log must have a valid date.
const dateRule = (log) => {
  // Test if the timestamp is a number or can be coerced into one.
  if (Number.isNaN(Number(log.timestamp.data))) {
    return {
      syncable: false,
      reason: 'Every log must have a valid date field.',
    };
  }
  return { syncable: true };
};

// If a seeding log does not have at least one planting asset, don't sync it
const seedingRule = (log, { assets }) => {
  if (log.type.data === 'farm_seeding') {
    const hasPlantingAsset = log.asset.data
      .some(logAsset => assets
        .some(asset => (
          asset.id === logAsset.id && asset.type === 'planting'
        )));
    if (!hasPlantingAsset) {
      return {
        syncable: false,
        reason: 'Seeding logs must have at least one planting asset.',
      };
    }
  }
  return { syncable: true };
};

export default [dateRule, seedingRule];
