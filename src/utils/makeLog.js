/*
  SOURCES & DESTINATIONS
  Theses constants are assigned to string values representing the possible
  sources & destinations to/from which the logs may be sent.
*/
const SQL = 'WEBSQL';
const SERVER = 'FARMOS_SERVER';
const STORE = 'VUEX_STORE';
/*
  MAKELOG
  A utility function for structuring logs within the app. It can be applied
  to an existing log before storing it in the database, posting it to the
  server, or for otherwise rendering logs in a standard format. It can also
  be used to generate a new log for the Vuex store by passing in no parameters.
  Provide an optional `dest` parameter to ensure the proper formatting for its
  destination.

  A CodeSandbox for experimenting with it can be found here:
  https://codesandbox.io/s/github/jgaehring/farmos-logfactory
*/

const makeLogFactory = (src, dest) => {
  if (src === STORE || src === undefined) {
    return ({
      // Assign default properties or leave them as optional
      log_owner = { changed: null, data: '' }, // eslint-disable-line camelcase
      // Quantity will be an array of objects, similar to area or asset
      quantity = { changed: null, data: [] },
      id,
      local_id, // eslint-disable-line camelcase
      name = { changed: null, data: '' },
      type = { changed: null, data: '' },
      timestamp = { changed: null, data: '' },
      images = { changed: null, data: [] },
      done = { changed: null, data: true },
      isCachedLocally = { changed: null, data: false },
      wasPushedToServer = { changed: null, data: false },
      remoteUri = { changed: null, data: '' },
      asset = { changed: null, data: [] }, // eslint-disable-line camelcase
      area = { changed: null, data: [] }, // eslint-disable-line camelcase
      geofield = { changed: null, data: [] }, // eslint-disable-line camelcase
      notes = { changed: null, data: '' }, // eslint-disable-line camelcase
      /*
      log_owner = '', // eslint-disable-line camelcase
      // Quantity will be an array of objects, similar to area or asset
      quantity = [],
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
      asset = [], // eslint-disable-line camelcase
      area = [], // eslint-disable-line camelcase
      geofield = [], // eslint-disable-line camelcase
      notes = '', // eslint-disable-line camelcase
      */
    } = {}) => {
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
          images: { data: parseImages(images.data), changed: images.changed }, // eslint-disable-line no-use-before-define, max-len
          // Use JSON.parse() to convert strings back to booleans
          done: { data: JSON.parse(done.data), changed: done.changed },
          isCachedLocally: { data: JSON.parse(isCachedLocally.data), changed: isCachedLocally.changed }, // eslint-disable-line max-len
          wasPushedToServer: { data: JSON.parse(wasPushedToServer.data), changed: wasPushedToServer.changed }, // eslint-disable-line max-len
          remoteUri,
          asset: { data: parseObjects(asset.data), changed: asset.changed }, // eslint-disable-line no-use-before-define, max-len
          area: { data: parseObjects(area.data), changed: area.changed }, // eslint-disable-line no-use-before-define, max-len
          geofield: { data: parseObjects(geofield.data), changed: geofield.changed }, // eslint-disable-line no-use-before-define, max-len
          /*
          log_owner: { data: log_owner, changed: nowStamp },
          notes: { data: notes, changed: nowStamp },
          quantity: { data: quantity, changed: nowStamp },
          id: { data: id, changed: nowStamp },
          local_id: { data: local_id, changed: nowStamp },
          name: { data: name, changed: nowStamp },
          type: { data: type, changed: nowStamp },
          timestamp: { data: timestamp, changed: nowStamp },
          // Use Array.concat() to make sure this is an array
          images: { data: parseImages(images), changed: nowStamp }, // eslint-disable-line no-use-before-define, max-len
          // Use JSON.parse() to convert strings back to booleans
          done: { data: JSON.parse(done), changed: nowStamp },
          isCachedLocally: { data: JSON.parse(isCachedLocally), changed: nowStamp },
          wasPushedToServer: { data: JSON.parse(wasPushedToServer), changed: nowStamp },
          remoteUri: { data: remoteUri, changed: nowStamp },
          asset: { data: parseObjects(asset), changed: nowStamp }, // eslint-disable-line no-use-before-define, max-len
          area: { data: parseObjects(area), changed: nowStamp }, // eslint-disable-line no-use-before-define, max-len
          geofield: { data: parseObjects(geofield), changed: nowStamp }, // eslint-disable-line no-use-before-define, max-len
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
          asset: parseObjects(asset), // eslint-disable-line no-use-before-define
          area: parseObjects(area), // eslint-disable-line no-use-before-define
          geofield: parseObjects(geofield), // eslint-disable-line no-use-before-define, max-len
          */
        };
      }
      // The format for sending logs to the farmOS REST Server.
      if (dest === SERVER) {
        log = {
          notes: {
            format: 'farm_format',
            value: notes,
          },
          // quantity,
          name,
          done,
          type,
          timestamp,
          images,
          asset,
          area,
          geofield,
        };
        /*
          Only return id property if one has already been assigned by the server,
          otherwise omit it so the server can assign a new one.
        */
        if (id) {
          log.id = id;
        }
        // If the log type is seeding, the server disallows area & geofield
        if (type === 'farm_seeding') {
          delete log.area;
          delete log.asset;
          delete log.geofield;
        }
      }
      // The format for inserting logs in WebSQL for local persistence.
      if (dest === SQL) {
        log = {
          log_owner: JSON.stringify(log_owner),
          notes: JSON.stringify(notes),
          quantity: JSON.stringify(quantity),
          id,
          name: JSON.stringify(name),
          type: JSON.stringify(type),
          timestamp: JSON.stringify(timestamp),
          images,
          done: JSON.stringify(done),
          wasPushedToServer: JSON.stringify(wasPushedToServer),
          remoteUri: JSON.stringify(remoteUri),
          asset: JSON.stringify(asset),
          area: JSON.stringify(area),
          geofield: JSON.stringify(geofield),
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
    };
  }
  if (src === SQL) {
    return ({
      // Assign default properties or leave them as optional
      log_owner = { changed: null, data: '' }, // eslint-disable-line camelcase
      // quantity will be an array of objects, similar to area or asset
      quantity = { changed: null, data: [] },
      id,
      local_id, // eslint-disable-line camelcase
      name = { changed: null, data: '' },
      type = { changed: null, data: '' },
      timestamp = { changed: null, data: '' },
      images = { changed: null, data: [] },
      done = { changed: null, data: true },
      isCachedLocally = { changed: null, data: false },
      wasPushedToServer = { changed: null, data: false },
      remoteUri = { changed: null, data: '' },
      asset = { changed: null, data: [] }, // eslint-disable-line camelcase
      area = { changed: null, data: [] }, // eslint-disable-line camelcase
      geofield = { changed: null, data: [] }, // eslint-disable-line camelcase
      notes = { changed: null, data: '' }, // eslint-disable-line camelcase
      /*
      log_owner = '', // eslint-disable-line camelcase
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
      asset = [], // eslint-disable-line camelcase
      area = [], // eslint-disable-line camelcase
      geofield = [], // eslint-disable-line camelcase
      notes = '', // eslint-disable-line camelcase
      */
    } = {}) => ({
      log_owner: JSON.parse(log_owner),
      notes: JSON.parse(notes),
      quantity: JSON.parse(quantity),
      id: id === 'undefined' ? undefined : id,
      local_id,
      name: JSON.parse(name),
      type: JSON.parse(type),
      timestamp: JSON.parse(timestamp),
      // Use Array.concat() to make sure this is an array
      images: { data: parseImages(JSON.parse(images).data), changed: JSON.parse(images).changed }, // eslint-disable-line no-use-before-define, max-len
      // images: parseImages(images), // eslint-disable-line no-use-before-define
      // Use JSON.parse() to convert strings back to booleans
      done: JSON.parse(done),
      // isCachedLocally is not stored in the DB; it is set when makeLog is called
      isCachedLocally,
      wasPushedToServer: JSON.parse(wasPushedToServer),
      remoteUri: JSON.parse(remoteUri),
      asset: { data: parseObjects(JSON.parse(asset).data), changed: JSON.parse(asset).changed }, // eslint-disable-line no-use-before-define, max-len
      // asset: parseObjects(asset), // eslint-disable-line no-use-before-define
      area: { data: parseObjects(JSON.parse(area).data), changed: JSON.parse(area).changed }, // eslint-disable-line no-use-before-define, max-len
      // area: parseObjects(area), // eslint-disable-line no-use-before-define
      geofield: { data: parseObjects(JSON.parse(geofield).data), changed: JSON.parse(geofield).changed }, // eslint-disable-line no-use-before-define, max-len
      // geofield: parseObjects(geofield), // eslint-disable-line no-use-before-define, max-len
    });
  }
  if (src === SERVER) {
    return (deserializedLogFromServer) => {
      const {
        log_owner, // eslint-disable-line camelcase
        quantity,
        id,
        local_id, // eslint-disable-line camelcase
        name,
        type,
        timestamp,
        images,
        done,
        uri,
        asset,
        area,
        geofield,
        notes,
      } = deserializedLogFromServer;
      const log = {
        log_owner,
        notes: parseNotes(notes), // eslint-disable-line no-use-before-define
        quantity,
        local_id,
        name,
        type,
        timestamp,
        images,
        done,
        isCachedLocally: false,
        wasPushedToServer: true,
        remoteUri: uri,
        asset,
        area,
        geofield,
      };
      if (id) {
        log.id = id;
      }
      return log;
    };
  }
  throw new Error('Incorrect parameters passed to makeLog');
};

export default {
  create: makeLogFactory(),
  toStore: makeLogFactory(STORE, STORE),
  toSql: makeLogFactory(STORE, SQL),
  toServer: makeLogFactory(STORE, SERVER),
  fromSql: makeLogFactory(SQL, STORE),
  fromServer: makeLogFactory(SERVER, STORE),
};

/*
  parseImages and parseObjects are used both in src: store and src: SQL
  For now, I will retain them in their original form, and use only on the data: property

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

// Pull value from SERVER notes and remove html tags
function parseNotes(notes) {
  if (notes.value !== undefined) {
    if (notes.value !== '' && notes.value !== null) {
      return notes.value.slice(3, -5);
    }
  }
  return '';
}
