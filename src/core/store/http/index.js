import {
  compose, reduce, filter, partition, equals, prop, uniqBy, flatten, map, dissoc,
} from 'ramda';
import farm from '../farmClient';
import rules from './rules';
import router from '../../router';
import { formatLogForServer, isUnsynced } from '../../../utils/farmLog';
import createQuery, { filterByTimestamp } from '../../../utils/createQuery';

export const partitionResponses = partition(compose(
  equals('fulfilled'),
  prop('status'),
));

export const flattenResponses = compose(
  uniqBy(prop('id')),
  flatten,
  map(prop('list')),
  map(prop('value')),
);

// Handles network errors (get & send): a reducer function that reduces an array
// of rejected network responses to a single error object that can be logged.
const syncErrorHandler = ({ error, loginRequired }, { reason, localLog }) => {
  // 400, 401 and 403 errors indicate bad credentials; login is required.
  if (reason.status >= 400
    && reason.status <= 403) {
    return {
      loginRequired: true,
      error: {
        ...error,
        errorCode: error.errorCode.concat(reason.status),
        message: `${error.message}${reason.status} error: ${reason.message}<br>`,
      },
    };
  }
  // If the error is a 404, this means the log was deleted on the server.
  // We are keeping 404 errors silent for now.
  if (reason.status === 404) {
    return { error, loginRequired };
  }
  // If there's any status code, it's some other HTTP error, probably 406 or
  // something in the 500 range. Just print it as is with the status code.
  if (reason.status !== undefined) {
    return {
      loginRequired: false,
      error: {
        ...error,
        errorCode: error.errorCode.concat(reason.status),
        message: `${error.message}${reason.status} error: ${reason.message}.<br>`,
      },
    };
  }
  // If there's no status code, it's either a Network Error or runtime error.
  // Check navigator.onLine to confirm the former.
  if (!navigator.onLine) {
    return {
      loginRequired: false,
      error: {
        ...error,
        message: `${error.message}${reason.message}. Check your internet connection.<br>`,
      },
    };
  }
  // Otherwise, it's a runtime error thrown sometime during the request
  // procedure; display the log name (if available) along with the error message
  // so we can debug.
  const message = localLog
    ? `${error.message}Error while syncing "${localLog.name}": ${reason.message}<br>`
    : `${error.message}Error while syncing: ${reason.message}<br>`;
  return {
    loginRequired: false,
    error: {
      ...error,
      errorCode: error.errorCode.concat(reason.status),
      message,
    },
  };
};

export function getRemoteLogs(context, payload) {
  const { commit, rootState } = context;
  const { pass: { localIDs = [] } = {} } = payload;
  const filters = dissoc('timestamp', payload.filter);
  const timeRange = prop('timestamp', payload.filter) || [];
  const ids = localIDs
    .map(localID => +rootState.farm.logs
      .find(log => log.localID === localID)
      ?.id)
    .filter(id => !!id);
  const responses = []
    .concat(filters ? farm().log.get(filters) : [])
    .concat((ids?.length > 0) ? farm().log.get(ids) : [])
    .map(req => req
      .then(res => ({ status: 'fulfilled', value: res }))
      .catch(err => ({ status: 'rejected', reason: err })));
  return Promise.all(responses)
    .then(partitionResponses)
    .then(([fulfilled, rejected]) => {
      flattenResponses(fulfilled)
        .filter(filterByTimestamp(timeRange))
        .forEach((serverLog) => {
          commit('mergeLogFromServer', serverLog);
        });
      // Check for errors, log them and redirect to login screen if needed.
      // Throw so if there are any subsequent promises chained to this one,
      // like sendRemoteLogs, they will be aborted.
      if (rejected.length > 0) {
        const initError = {
          loginRequired: false,
          error: {
            message: '', errorCode: [], level: 'warning', show: true,
          },
        };
        const { error, loginRequired } = rejected.reduce(syncErrorHandler, initError);
        commit('logError', error);
        if (loginRequired) { router.push('/login'); }
        throw new Error(error.message);
      }
    });
}

/*
  A reducer function that returns a tuple, separateing logs into those that can
  and cannot be synced, as well as required updates for those logs that are
  syncable if those updates are applied. It gets its rules from ./rules.js.
*/
const syncReducer = ([syncables, unsyncables, updates], log) => {
  if (isUnsynced(log)) {
    const { localID } = log;
    const initialState = {
      syncable: true,
      message: `Could not sync "${log.name}":`,
      update: { localID },
    };
    const { syncable, message, update } = rules.reduce((acc, rule) => {
      const result = rule(log);
      if (!result.syncable) {
        return {
          syncable: false,
          message: `${acc.message}<br>- ${result.reason}`,
        };
      }
      return !result.updateProps
        ? acc
        : { ...acc, update: { ...acc.update, ...result.updateProps } };
    }, initialState);
    if (!syncable) {
      return [syncables, unsyncables.concat({ message }), updates];
    }
    /*
      Add log to list of syncables, and if there are more props to update,
      other than the localID, add those to the list.
    */
    const updatesRequired = Object.keys(update).length > 1;
    return [
      syncables.concat(log),
      unsyncables,
      updatesRequired ? updates.concat(update) : updates,
    ];
  }
  /*
    If the log has been synced, do nothing.
  */
  return [syncables, unsyncables, updates];
};

const createGroupLogs = (filters, pass) => compose(
  reduce(syncReducer, [[], [], []]),
  filter(createQuery(filters, pass)),
);
export function sendRemoteLogs(context, payload) {
  const { commit, rootState } = context;
  const { filter: _filter, pass } = payload;

  // Process and sort the logs into syncable and unsyncable logs,
  // as well as updates needed before syncing.
  const groupLogs = createGroupLogs(_filter, pass);
  const [syncables, unsyncables, updates] = groupLogs(rootState.farm.logs);
  // For all logs that are unsyncable, display an error message.
  unsyncables.forEach(({ message }) => {
    if (message) {
      commit('logError', {
        message,
        level: 'warning',
        show: true,
      });
    }
  });
  // Before syncing, commit all necessary updates.
  updates.forEach((update) => {
    commit('updateLog', update);
  });
  // Send all logs that are syncable, but intercept any errors and
  // aggregate them with the successful responses, sort of like
  // Promise.allSettled(), but we'll also include the localLog that each
  // response corresponds to so the handlers know how to match them up.
  const responses = Promise.all(syncables
    .map(formatLogForServer)
    .map(farm().log.send)
    .map((promise, i) => {
      const localLog = syncables[i];
      return promise
        .then(res => ({ status: 'fulfilled', value: res, localLog }))
        .catch(err => ({ status: 'rejected', reason: err, localLog }));
    }));
  return responses.then((rs) => {
    // Split the responses into "fulfilled" and "rejected" groups.
    const [fulfilled, rejected] = partitionResponses(rs);

    // Handle the successful responses by updating the logs as synced.
    if (fulfilled.length > 0) {
      fulfilled.forEach(({ value, localLog }) => {
        const props = {
          localID: localLog.localID,
          id: value.id,
          url: value.uri,
          lastSync: true,
        };
        commit('updateLog', props);
      });
    }

    // Check for errors, log them and redirect to login screen if needed.
    if (rejected.length > 0) {
      const initError = {
        loginRequired: false,
        error: {
          message: '', errorCode: [], level: 'warning', show: true,
        },
      };
      const { error, loginRequired } = rejected.reduce(syncErrorHandler, initError);
      commit('logError', error);
      if (loginRequired) { router.push('/login'); }
    }

    // Return the responses to the caller.
    return rs;
  });
}
