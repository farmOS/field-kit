/**
 * RULES
 * =====
 * All rules functions, which are similar to predicate functions, take a log
 * as their first parameter, and an optional dependencies object as their
 * second parameter. They return an object with three fields: `syncable`, a
 * boolean that determines whether there will be an attempt to sync the log;
 * `reason`, a string containing the reason why it cannot be synced; and
 * `updateProps`, which is an object containing log properties that need to be
 * updated, if it's the case that the log is syncable but we need to auto-
 * generate some properties before sending to the server. Dependendencies should
 * be provided in http/module.js, when the syncReducer is instantiated under the
 * syncAllLogs action.
 */

// If a log is missing a name, generate one.
const nameRule = (log, { logTypes }) => {
  if (!log.name.data) {
    const date = new Date(log.timestamp.data * 1000);
    const prettyDate = date.toLocaleDateString();
    const prettyTime = date.toLocaleTimeString(undefined, {
      timeStyle: 'short',
      hour12: false,
    });
    const name = `${logTypes[log.type.data].label} ${prettyDate} - ${prettyTime}`;
    return {
      syncable: true,
      updateProps: {
        name: {
          data: name,
          changed: (Date.now() / 1000).toFixed(0),
        },
      },
    };
  }
  return { syncable: true };
};

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

export default [nameRule, dateRule, seedingRule];
