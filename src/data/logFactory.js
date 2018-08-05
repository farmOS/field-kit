/*
  LOGFACTORY
  A utility function for structuring logs within the data plugin. It can be
  applied to an existing log before storing it in the database, posting it
  to the server, or for otherwise rendering logs in a standard format.

  Provide an optional `dest` parameter to ensure it receives the proper
  formatting for its destination. It can also be used to generate a new log
  for the Vuex store by passing in no parameters.
*/
export default function (
  // Assign default properties or leave them as optional
  {
    log_owner = '', // eslint-disable-line camelcase
    notes = '',
    quantity = '',
    id,
    local_id, // eslint-disable-line camelcase
    name = '',
    type = '',
    timestamp = '',
    photo_loc = '', // eslint-disable-line camelcase
    done = false,
    isCachedLocally = false,
    wasPushedToServer = false,
  } = {},
  dest,
) {
  let log;
  /*
    The format for adding logs to the Vuex store; this is also the default
    if there is no destination argument passed.
  */
  if (dest === 'VUEX' || dest === undefined) {
    log = {
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
    };
  }
  // The format for sending logs to the farmOS REST Server.
  if (dest === 'SERVER') {
    log = {
      notes,
      // quantity,
      name,
      type,
      // timestamp,
      photo_loc,
    };
    /*
      Only return id property if one has already been assigned by the server,
      otherwise omit it so the server can assign a new one.
    */
    if (id) {
      log.id = id;
    }
  }
  // The format for inserting logs in WebSQL for local persistence.
  if (dest === 'WEBSQL') {
    log = {
      log_owner,
      notes,
      quantity,
      id,
      name,
      type,
      timestamp,
      photo_loc,
      done,
      wasPushedToServer,
    };
    /*
      Only return local_id property if one has already been assigned by WebSQL,
      otherwise let WebSQL assign a new one.
    */
    if (local_id) { // eslint-disable-line camelcase
      log.local_id = local_id; // eslint-disable-line camelcase
    }
  }
  return log;
}
