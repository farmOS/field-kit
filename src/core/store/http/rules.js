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
 * sendRemoteLogs function.
 */
import { getLogTypes } from '../../../utils/farmLog';

const logTypes = getLogTypes();

// A helper that determines if a value is falsey, or is an empty array or object.
const isNullish = val => (
  !val
  || (Array.isArray(val) && val.length < 1)
  || (typeof val === 'object' && Object.values(val).length < 1)
);

// If a log is missing a name, generate one.
const nameRule = (log) => {
  if (!log.name) {
    const date = new Date(log.timestamp * 1000);
    const prettyDate = date.toLocaleDateString();
    const prettyTime = date.toLocaleTimeString(undefined, {
      timeStyle: 'short',
      hour12: false,
    });
    const name = `${logTypes[log.type].label} ${prettyDate} - ${prettyTime}`;
    return {
      syncable: true,
      updateProps: { name },
    };
  }
  return { syncable: true };
};

// Every log must have a valid date.
const dateRule = (log) => {
  // Test if the timestamp is a number or can be coerced into one.
  if (Number.isNaN(Number(log.timestamp))) {
    return {
      syncable: false,
      reason: 'Every log must have a valid date field.',
    };
  }
  return { syncable: true };
};

// Check for required fields based on the schema for the current log's type.
const requiredFieldsRule = (log) => {
  const schema = logTypes[log.type];
  return Object.entries(schema.fields)
    .reduce(({ syncable, reason }, [field, { required, label }]) => {
      if (required && isNullish(log[field])) {
        return {
          syncable: false,
          reason: `${reason}${schema.label} logs must have a value in the ${label} field. `,
        };
      }
      return { syncable, reason };
    }, { syncable: true, reason: '' });
};

export default [nameRule, dateRule, requiredFieldsRule];
