/*
  DESTINATIONS
  Import these destination constants when you import the logFactory, and use
  them instead of using the raw strings. This will make it easier to update the
  logFactory's API in the future without committing breaking changes. The
  constants are assigned to string values representing the possible destinations
  to which the logs may be sent.
*/
export const SQL = 'WEBSQL';
export const SERVER = 'FARMOS_SERVER';
export const STORE = 'VUEX_STORE';
export const STOREFROMSERVER = 'VUEX_STORE_FROM_SERVER';

/*
  LOGFACTORY
  A utility function for structuring logs within the data plugin. It can be
  applied to an existing log before storing it in the database, posting it to
  the server, or for otherwise rendering logs in a standard format. It can also
  be used to generate a new log for the Vuex store by passing in no parameters.
  Provide an optional `dest` parameter to ensure the proper formatting for its
  destination. TODO: It could be wise to add a source parameter as well.

  A CodeSandbox for experimenting with it can be found here:
  https://codesandbox.io/s/github/jgaehring/farmos-logfactory
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
    images = [],
    done = true,
    isCachedLocally = false,
    wasPushedToServer = false,
    remoteUri = '',
    field_farm_asset = [], // eslint-disable-line camelcase
    field_farm_area = [], // eslint-disable-line camelcase
    field_farm_geofield = [], // eslint-disable-line camelcase
    field_farm_notes = { value: '', format: 'farm_format' }, // eslint-disable-line camelcase
  } = {},
  dest,
) {
  let log;
  /*
    The format for adding logs to the Vuex store; this is also the default
    if there is no destination argument passed.
  */
  if (dest === STORE || dest === undefined) {
    log = {
      log_owner,
      notes,
      quantity,
      id,
      local_id,
      name,
      type,
      timestamp,
      // Use Array.concat() to make sure this is an array
      images: parseImages(images), // eslint-disable-line no-use-before-define
      // Use JSON.parse() to convert strings back to booleans
      done: JSON.parse(done),
      isCachedLocally: JSON.parse(isCachedLocally),
      wasPushedToServer: JSON.parse(wasPushedToServer),
      remoteUri,
      field_farm_asset: parseObjects(field_farm_asset), // eslint-disable-line no-use-before-define
      field_farm_area: parseObjects(field_farm_area), // eslint-disable-line no-use-before-define
      field_farm_geofield: parseObjects(field_farm_geofield), // eslint-disable-line no-use-before-define, max-len
    };
  }
      // This dest is called when bringing logs from the server into the vuex store
  if (dest === STOREFROMSERVER) {
    // console.log(`NOTES FIELD FOR ${name}:`, JSON.parse(field_farm_notes))
    log = {
      log_owner,
      notes: parseNotes(field_farm_notes), // eslint-disable-line no-use-before-define
      quantity,
      id,
      local_id,
      name,
      type,
      timestamp,
      // Use Array.concat() to make sure this is an array
      images: parseImages(images), // eslint-disable-line no-use-before-define
      // Use JSON.parse() to convert strings back to booleans
      done: JSON.parse(done),
      isCachedLocally: JSON.parse(isCachedLocally),
      wasPushedToServer: JSON.parse(wasPushedToServer),
      remoteUri,
      field_farm_asset: parseObjects(field_farm_asset), // eslint-disable-line no-use-before-define
      field_farm_area: parseObjects(field_farm_area), // eslint-disable-line no-use-before-define
      field_farm_geofield: parseObjects(field_farm_geofield), // eslint-disable-line no-use-before-define, max-len
    };
  }
  // The format for sending logs to the farmOS REST Server.
  if (dest === SERVER) {
    // Just take the id from the assets/areas before sending
    const assets = field_farm_asset.map(asset => ({ id: asset.id }));
    const areas = field_farm_area.map(area => ({ id: area.tid }));
    log = {
      field_farm_notes: {
        format: 'farm_format',
        value: `<p>${notes}</p>\n`,
      },
      // quantity,
      name,
      done,
      type,
      timestamp,
      field_farm_images: images,
      field_farm_asset: assets,
      field_farm_area: areas,
      field_farm_geofield,
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
  if (dest === SQL) {
    log = {
      log_owner,
      notes,
      quantity,
      id,
      name,
      type,
      timestamp,
      images,
      done,
      wasPushedToServer,
      remoteUri,
      field_farm_asset: JSON.stringify(field_farm_asset),
      field_farm_area: JSON.stringify(field_farm_area),
      field_farm_geofield: JSON.stringify(field_farm_geofield),
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

/*
  This utility function, along with the use of `JSON.parse()` above,
  provide a quick hacky solution, but we need something better
  for parsing data when it goes between Vuex and WebSQL. See:
  https://github.com/farmOS/farmOS-native/issues/27#issuecomment-412093491
  https://github.com/farmOS/farmOS-native/issues/40#issuecomment-419131892
  https://github.com/farmOS/farmOS-native/issues/45
*/
function parseImages(x) {
  if (typeof x === 'object') {
    return x;
  }
  if (typeof x === 'string') {
    return (x === '') ? [] : [].concat(x);
  }
  throw new Error(`${x} cannot be parsed as an image array`);
}

// TODO: can this be used in place of parseImages?
function parseObjects(x) {
  if (typeof x === 'object') {
    return x;
  }
  if (typeof x === 'string') {
    return JSON.parse(x);
  }
  throw new Error(`${x} cannot be parsed as an image array`);
}

// Pull value from note and remove html tags
function parseNotes(note) {
  if (note.value === '') {
    return '';
  }
  return note.value.slice(3, -5);
}
