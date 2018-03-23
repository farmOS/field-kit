// A helper function for creating new log items with default properties
export function logFactory ({
  // TODO: Owner should be identified by user id, once we have authentication
  log_owner = '',
  notes = '',
  quantity = '',
  id = null,
  local_id = null,
  name = '',
  type = '',
  timestamp = '',
  done = false,
  isCachedLocally = false,
} = {}) {
  return {
    log_owner,
    notes,
    quantity,
    id,
    local_id,
    name,
    type,
    timestamp,
    done,
    isCachedLocally,
  };
}
