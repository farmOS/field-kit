/**
  * A utility function for structuring logs within the data plugin,
  * before storing in the database, posting to the server, or for
  * otherwise rendering logs in a standard format.
**/
export function logFactory ({
  // Assign default properties or leave them as optional
  log_owner = '',
  notes = '',
  quantity = '',
  id,
  local_id,
  name = '',
  type = '',
  timestamp = '',
  done = false,
  isCachedLocally = false,
  wasPushedToServer = false,
} = {}) {
  let log = {
    log_owner,
    notes,
    quantity,
    id,
    name,
    type,
    timestamp,
    done,
    isCachedLocally,
    wasPushedToServer
  };
  // Only return the id property if one has already been assigned by the server, otherwise omit it so the server can assign a new one.
  if (id) {
    log.id = id;
  };
  // Only return the local_id property if one has already been assigned by WebSQL, otherwise let WebSQL assign a new one.
  if (local_id) {
    log.local_id = local_id;
  };
  return log;
}
