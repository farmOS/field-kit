// A helper function for creating new log items with default properties
export default function ({
  // TODO: Owner should be identified by user id, once we have authentication
  log_owner = '', // eslint-disable-line camelcase
  notes = '',
  quantity = '',
  id = null,
  local_id = null, // eslint-disable-line camelcase
  name = '',
  type = '',
  timestamp = '',
  photo_loc = '', // eslint-disable-line camelcase
  done = false,
  isCachedLocally = false,
  wasPushedToServer = false,
  isReadyToSync = false,
  remoteUri = '',
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
    photo_loc,
    done,
    isCachedLocally,
    wasPushedToServer,
    isReadyToSync,
    remoteUri,
  };
}
