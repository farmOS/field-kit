/*
  SOURCES & DESTINATIONS
  Theses constants are assigned to string values representing the possible
  sources & destinations to/from which the logs may be sent.
*/
const SERVER = 'FARMOS_SERVER';
const STORE = 'VUEX_STORE';
const IDB = 'INDEXEDDB';
const nowStamp = (Date.now() / 1000).toFixed(0);
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
      log_category = { changed: null, data: [] }, // eslint-disable-line camelcase
      equipment = { changed: null, data: [] },
      id,
      local_id, // eslint-disable-line camelcase
      name = { changed: null, data: '' },
      type = { changed: null, data: '' },
      timestamp = { changed: null, data: '' },
      images = { changed: null, data: [] },
      done = { changed: null, data: true },
      isCachedLocally = false,
      isReadyToSync = false,
      wasPushedToServer = false,
      remoteUri = '',
      asset = { changed: null, data: [] }, // eslint-disable-line camelcase
      area = { changed: null, data: [] }, // eslint-disable-line camelcase
      geofield = { changed: null, data: [] }, // eslint-disable-line camelcase
      notes = { changed: null, data: '' }, // eslint-disable-line camelcase
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
          quantity: { data: parseObjects(quantity.data), changed: quantity.changed }, // eslint-disable-line no-use-before-define, max-len
          log_category: { data: parseObjects(log_category.data), changed: log_category.changed }, // eslint-disable-line no-use-before-define, max-len
          equipment: { data: parseObjects(equipment.data), changed: equipment.changed }, // eslint-disable-line no-use-before-define, max-len
          id,
          local_id,
          name,
          type,
          timestamp,
          // Use Array.concat() to make sure this is an array
          images: { data: parseImages(images.data), changed: images.changed }, // eslint-disable-line no-use-before-define, max-len
          // Use JSON.parse() to convert strings back to booleans
          done: { data: JSON.parse(done.data), changed: done.changed },
          isCachedLocally: JSON.parse(isCachedLocally), // eslint-disable-line max-len
          isReadyToSync: JSON.parse(isReadyToSync), // eslint-disable-line max-len
          wasPushedToServer: JSON.parse(wasPushedToServer), // eslint-disable-line max-len
          remoteUri,
          asset: { data: parseObjects(asset.data), changed: asset.changed }, // eslint-disable-line no-use-before-define, max-len
        };
        if (type.data !== 'farm_seeding' && area) {
          log.area = { data: parseObjects(area.data), changed: area.changed }; // eslint-disable-line no-use-before-define, max-len
        }
        if (type.data !== 'farm_seeding' && geofield) { // eslint-disable-line no-use-before-define, max-len
          log.geofield = { data: parseObjects(geofield.data), changed: geofield.changed }; // eslint-disable-line no-use-before-define, max-len
        }
      }
      // The format for sending logs to the farmOS REST Server.
      if (dest === SERVER) {
        log = {
          notes: {
            format: 'farm_format',
            value: notes.data,
          },
          name: name.data,
          done: done.data,
          type: type.data,
          timestamp: timestamp.data,
          images: images.data,
          asset: asset.data,
          quantity: quantity.data,
          log_category: log_category.data,
          equipment: equipment.data,
        };
        /*
          Only return id property if one has already been assigned by the server,
          otherwise omit it so the server can assign a new one.
        */
        if (id) {
          log.id = id;
        }
        // Seedings do not have areas and geofields
        if (type.data !== 'farm_seeding' && area) {
          log.area = area.data;
        }
        if (type.data !== 'farm_seeding' && geofield) {
          log.geofield = geofield.data;
        }
      }
      // The format for inserting logs in IDB for local persistence.
      if (dest === IDB) {
        log = {
          log_owner,
          notes,
          quantity,
          log_category,
          equipment,
          id,
          name,
          type,
          timestamp,
          images,
          done,
          wasPushedToServer,
          remoteUri,
          asset,
        };
        /*
          Only return local_id property if one has already been assigned by WebSQL,
          otherwise let WebSQL assign a new one.
        */
        if (local_id) { // eslint-disable-line camelcase
          log.local_id = local_id; // eslint-disable-line camelcase
        }
        // Seedings do not have areas and geofields
        if (type.data !== 'farm_seeding' && area) {
          log.area = area;
        }
        if (type.data !== 'farm_seeding' && geofield) {
          log.geofield = geofield;
        }
      }
      return log;
    };
  }
  if (src === SERVER) {
    return (deserializedLogFromServer) => {
      // Assign default properties or leave them as optional
      const {
        log_owner, // eslint-disable-line camelcase
        quantity,
        log_category, // eslint-disable-line camelcase
        equipment,
        id,
        local_id, // eslint-disable-line camelcase
        name,
        type,
        timestamp,
        images,
        done,
        url,
        asset,
        area,
        geofield,
        notes,
      } = deserializedLogFromServer;
      const log = {
        log_owner: { data: log_owner, changed: nowStamp },
        notes: { data: parseNotes(notes), changed: nowStamp }, // eslint-disable-line no-use-before-define, max-len
        quantity: { data: quantity, changed: nowStamp },
        log_category: { data: log_category, changed: nowStamp },
        equipment: { data: equipment, changed: nowStamp },
        local_id,
        name: { data: name, changed: nowStamp },
        type: { data: type, changed: nowStamp },
        timestamp: { data: timestamp, changed: nowStamp },
        images: { data: images, changed: nowStamp },
        done: { data: done, changed: nowStamp },
        isCachedLocally: false,
        wasPushedToServer: true,
        remoteUri: url,
        asset: { data: asset, changed: nowStamp },
      };
      // Seedings do not have areas and geofields
      if (type !== 'farm_seeding' && area) {
        log.area = { data: area, changed: nowStamp };
      }
      if (type !== 'farm_seeding' && geofield) {
        log.geofield = { data: geofield, changed: nowStamp };
      }
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
  toIdb: makeLogFactory(STORE, IDB),
  toServer: makeLogFactory(STORE, SERVER),
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
    // Image references obtained from the server are objects
    const imageArray = [];
    if (Array.isArray(x)) {
      x.forEach((img) => {
        if (typeof img === 'string') {
          // imageArray.push(checkJSON(img));
          imageArray.push(img);
        } else {
          Object.keys(img).forEach((key) => {
            if (img[key].id) {
              imageArray.push(`${img[key].id}`);
            } else {
              imageArray.push(img[key]);
            }
          });
        }
      });
    } else {
      Object.keys(x).forEach((key) => {
        imageArray.push(x[key]);
      });
    }
    return imageArray;
  }
  if (typeof x === 'string') {
    // return (x === '') ? [] : [].concat(checkJSON(x));
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
  throw new Error(`${x} cannot be parsed as an object array`);
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
