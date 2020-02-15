import rules from './rules';

// Extend Error so we can propagate more info to the error handler
export class SyncError extends Error {
  constructor({
    responses = [],
  } = {}, ...params) {
    super(...params);
    this.name = 'SyncError';
    // Custom debugging information
    this.responses = responses;
  }
}

/*
  A factory that takes dependencies supplied by the caller and returns a reducer
  function that separates logs into those that can and cannot be synced,
  returning a tuple. It gets its rules from ./rules.js.
*/
export const createSyncReducer = deps => ([syncables, unsyncables, updates], log, index) => {
  const newUpdates = { index, props: {} };
  if (log.isReadyToSync && !log.wasPushedToServer) {
    const { syncable, message } = rules.reduce((acc, rule) => {
      const result = rule(log, deps);
      if (!result.syncable) {
        return {
          syncable: false,
          message: `${acc.message}<br>- ${result.reason}`,
        };
      }
      if (result.updateProps) {
        newUpdates.props = {
          ...newUpdates.props,
          ...result.updateProps,
        };
      }
      return acc;
    }, { syncable: true, message: `Could not sync "${log.name.data}":` });
    if (!syncable) {
      return [syncables, unsyncables.concat({ index, message }), updates];
    }
    /*
      Add log to list of syncables if wasPushedToServer is false
      and log is ready to sync
    */
    const updatesRequired = Object.values(newUpdates.props).length > 0;
    if (updatesRequired) { newUpdates.props.isCachedLocally = false; }
    return [
      syncables.concat(index),
      unsyncables,
      updatesRequired ? updates.concat(newUpdates) : updates,
    ];
  }
  /*
    If wasPushedToServer is true or log is not ready to sync, do nothing
  */
  return [syncables, unsyncables, updates];
};
