/**
 * The backups here represent an ephemeral cache of transactions, recorded by the
 * `revise()` function in `useEntities`, but befor they've been committed. This
 * is to avoid unnecessary or invalid calls to the database or server, for instance
 * when the user is typing or drawing incomplete geometry on a map, while still
 * preserving all data the moment it is entered. Such backups are also keyed to
 * the current route, as a way of sandboxing one module's changes from another,
 * but this might be overkill.
 */

const SCHEME = 'backup://';

const isNearest = (prevPath, curPath) =>
  prevPath.split('/').length < curPath.split('/').length;

// Takes a route's path, such as '/tasks/f17110c4-5390-4ec7-8911-a44f152d8726/map',
// and its params, such as `{ id: 'f17110c4-5390-4ec7-8911-a44f152d8726' }, and
// reconstructs the original route record, in this instance '/tasks/:id/map'.
const encodeRoute = ({ matched }) =>
  matched.reduce((prevPath, { path: curPath }) =>
    (isNearest(prevPath, curPath) || prevPath === curPath ? curPath : prevPath), '');

// 'backup:f17110c4-5390-4ec7-8911-a44f152d8726.activity.log/tasks/:id/map#2022-03-16T13:53:58.894Z'
const encodeBackupURI = (entity, type, id, route, timestamp = new Date().toISOString()) =>
  `${SCHEME}${id}.${type}.${entity}${encodeRoute(route)}#${timestamp}`;

const decodeBackupURI = (uri) => {
  const url = new URL(uri.replace('backup', 'https'));
  const { hostname, pathname, hash } = url;
  const [id, type, entity] = hostname.split('.');
  const timestamp = hash.replace('#', '');
  return {
    entity, type, id, pathname, timestamp,
  };
};

export function restoreTransactions(entity, type, id, route) {
  // Create a new URI, using an updated timestamp, tied to these transactions
  const uri = encodeBackupURI(entity, type, id, route);
  const isMatchingRoute = (key) => {
    const { pathname } = decodeBackupURI(key);
    return route.matched.some(r => r.path === pathname);
  };
  const matchingBackups = Object.keys(localStorage)
    .filter(key => key.startsWith(`${SCHEME}${id}`) && isMatchingRoute(key));
  if (matchingBackups.length < 1) return [uri, []];
  const bestMatch = matchingBackups.reduce((prev, key) => {
    const backup = JSON.parse(localStorage.getItem(key));
    if (!Array.isArray(backup)) return prev;
    const cur = { ...decodeBackupURI(key), key, backup };
    if (prev.backup.length < 1 || isNearest(prev.pathname, cur.pathname)) {
      return cur;
    }
    return new Date(prev.timestamp) > new Date(cur.timestamp) ? prev : cur;
  }, { backup: [] });
  // Delete the old backups, to remove duplicates.
  matchingBackups.forEach((key) => {
    localStorage.removeItem(key);
  });
  // This is a hack to turn plain object fields back into function calls. For
  // more details see the comments on backupTransactions below.
  const transactions = bestMatch.backup.map(fields => () => fields);
  // Return a tuple.
  return [uri, transactions];
}

// Save a record of transactions. Ideally these should not be an array of fields
// but an array of functions. That would guarantee atomicity. I've tried
// implementing this with the `new Function()` constructor to avoid using
// `eval()`, but the transaction callbacks still need some access to local
// variables in the caller's scope, and I don't have time to work that out right
// now. So this is the first part of the hack mentioned above. For more details, see:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!
export function backupTransactions(uri, fields) {
  const prevTxs = JSON.parse(localStorage.getItem(uri)) || [];
  const transactions = [...prevTxs, fields];
  localStorage.setItem(uri, JSON.stringify(transactions));
}

export function clearBackup(uri) {
  localStorage.removeItem(uri);
}
