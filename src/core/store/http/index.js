import {
  compose, reduce, filter, partition, equals, prop, uniqBy, flatten, map, dissoc,
} from 'ramda';
import farm from '../farmClient';
import rules from './rules';
import SyncError from './SyncError';
import { formatLogForServer, isUnsynced } from '../../../utils/farmLog';
import createQuery, { filterByTimestamp } from '../../../utils/createQuery';

export const checkHost = () => {
  if (localStorage.getItem('host') !== null) {
    return Promise.resolve();
  }
  return Promise.reject(new SyncError('Login required.', { loginRequired: true }));
};

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

export function getRemoteLogs(context, payload) {
  const { commit, rootState } = context;
  const { pass: { localIDs = [] } = {} } = payload;
  const filters = payload.filter ? dissoc('timestamp', payload.filter) : undefined;
  const timeRange = prop('timestamp', payload.filter) || [];
  const ids = localIDs
    .map(localID => +rootState.farm.logs
      .find(log => log.localID === localID)
      ?.id)
    .filter(id => !!id);
  return checkHost()
    .then(() => Promise.all([]
      .concat(filters ? farm().log.get(filters) : [])
      .concat((ids?.length > 0) ? farm().log.get(ids) : [])
      .map(req => req
        .then(res => ({ status: 'fulfilled', value: res }))
        .catch(err => ({ status: 'rejected', reason: err })))))
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
        throw new SyncError(rejected);
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
      localLog: log,
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
    if (rejected.length > 0 || unsyncables.length > 0) {
      throw new SyncError(unsyncables.concat(rejected));
    }

    // Return the responses to the caller.
    return rs;
  });
}
