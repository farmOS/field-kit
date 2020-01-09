import rules from './rules';
import makeLog from '@/utils/makeLog';

// Extend Error so we can propagate more info to the error handler
export class SyncError extends Error {
  constructor({
    responses = [],
  } = {}, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
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

export function checkLog(serverLog, allLogs, syncDate) {
  // The localLog will be passed as logStatus.log if localChange checks true
  const logStatus = {
    localId: null,
    storeIndex: null,
    localChange: true,
    serverChange: false,
    log: null,
  };
  allLogs.forEach((localLog, index) => {
    if (localLog.id) {
      /*
        If a local log has an id field, see if it is the same as the server log.
        In this case set lotStatus.localId and .storeIndex
        Also check whethe the log is unsynced (wasPushedToServer true)
      */
      if (localLog.id === serverLog.id) {
        logStatus.localId = localLog.localID;
        logStatus.storeIndex = index;
        if (JSON.parse(localLog.wasPushedToServer) === true) {
          logStatus.localChange = false;
        } else {
          logStatus.log = localLog;
        }
        if (+serverLog.changed > +syncDate) {
          logStatus.serverChange = true;
        }
      }
    }
  });
  return logStatus;
}

// Process each log on its way from the server to the logFactory
export function processLog(log, checkStatus, syncDate) {
  /*
  If the log is not present locally, return the server version.
  If the log is present locally, but has not been changed since the last sync,
  return the new version from the server (with localID)
  If the log is present locally and has been changed, check log.changed from the server
  against the changed property of each log attribute
   - If any attribute has been changed more recently than the server log, keep it
   - Otherwise take changes from the server
  */
  if (checkStatus.localId === null) {
    return makeLog.fromServer({
      ...log,
      wasPushedToServer: true,
      // Trying to make isReady..
      isReadyToSync: false,
      done: (parseInt(log.done, 10) === 1),
    });
  }
  if (!checkStatus.localChange && checkStatus.serverChange) {
    // Update the log with all data from the server
    return makeLog.fromServer({
      ...log,
      wasPushedToServer: true,
      isReadyToSync: false,
      localID: checkStatus.localId,
      done: (parseInt(log.done, 10) === 1),
    });
  }
  /*
  Replace properties of the local log that have not been modified since
  the last sync with data from the server.
  For properties that have been completed since the sync date,
  Present choice to retain either the log or the server version
  */
  const storeLog = checkStatus.log;
  const servLogBuilder = {};
  const locLogBuilder = {};

  /*
  We compare changed dates for local log properties against the date of last sync.
  madeFromServer is used as a source
  for building the merged log, to keep formatting consistent
  */
  const madeFromServer = makeLog.fromServer(log);
  Object.keys(storeLog).forEach((key) => {
    if (storeLog[key].changed && storeLog[key].changed !== null) {
      if (+storeLog[key].changed < +syncDate) {
        servLogBuilder[key] = madeFromServer[key];
      } else {
        locLogBuilder[key] = storeLog[key];
      }
    }
  });
  return makeLog.toStore({
    ...locLogBuilder,
    ...servLogBuilder,
    wasPushedToServer: false,
    localID: checkStatus.localId,
    id: log.id,
    done: {
      changed: Math.floor(Date.now() / 1000),
      data: (+log.done === 1),
    },
    isReadyToSync: true,
  });
}
