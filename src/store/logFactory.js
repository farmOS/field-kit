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
  images = [],
  done = true,
  isCachedLocally = false,
  wasPushedToServer = false,
  isReadyToSync = false,
  remoteUri = '',
  // Adding field_farm_asset to ensure that assets are being assigned correctly
  field_farm_asset= [],
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
    images,
    done,
    isCachedLocally,
    wasPushedToServer,
    isReadyToSync,
    remoteUri,
    // Adding field_farm_asset to ensure that assets are being assigned correctly
    field_farm_asset,
  };
}
