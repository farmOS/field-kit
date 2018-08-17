import logFactory, { STORE, SQL, SERVER } from './logFactory';

export default {

  actions: {

    createRecord({ commit }, newLog) {
      const tableName = newLog.type;
      const newRecord = logFactory(newLog, SQL);
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => makeTable(db, tableName, newRecord)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, tableName, newRecord)) // eslint-disable-line no-use-before-define, max-len
        .then(results => (
          // Can we be sure this will always be the CURRENT log?
          // Not if we use this action to add new records received from the server
          commit('updateCurrentLog', {
            local_id: results.insertId,
            isCachedLocally: true,
          })));
    },

    loadCachedLogs({ commit }, logType) {
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getRecords(db, logType)) // eslint-disable-line no-use-before-define
        .then((results) => {
          const cachedLogs = results.map(log => (
            logFactory({
              ...log,
              isCachedLocally: true,
            }, STORE)
          ));
          commit('addLogs', cachedLogs);
        })
        .catch(console.error);
    },

    updateRecord({ commit, rootState }, newProps) {
      const newLog = logFactory({
        ...rootState.farm.logs[rootState.farm.currentLogIndex],
        ...newProps,
      }, SQL);
      const table = newLog.type;
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, table)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, table, newLog)) // eslint-disable-line no-use-before-define
        // Can we be sure this will always be the CURRENT log?
        .then(() => commit('updateCurrentLog', { isCachedLocally: true }));
    },


    // SEND RECORDS TO SERVER
    pushToServer({ commit, rootState }, payload) {
      const storage = window.localStorage;
      const storedUrl = storage.getItem('url');
      const storedToken = storage.getItem('token');

      function handleSyncResponse(response, index) {
        commit('updateLogs', {
          indices: [index],
          mapper(log) {
            return logFactory({
              ...log,
              id: response.id,
              wasPushedToServer: true,
              remoteUri: response.uri,
            });
          },
        });
      }

      function handleSyncError(error, index) {
        // Do something with a TypeError object (mostly likely no connection)
        if (typeof error === 'object' && error.status === undefined) {
          const errorPayload = {
            message: `Unable to sync "${rootState.farm.logs[index].name}" because the network is currently unavailable. Please try syncing again later.`,
            errorCode: error.statusText,
            level: 'warning',
            show: true,
          };
          commit('logError', errorPayload);
          commit('updateLogs', {
            indices: [index],
            mapper(log) {
              return logFactory({
                ...log,
                isReadyToSync: false,
              });
            },
          });
          console.error('No connection available. Error: ', error);
        } else if (typeof error === 'object' && error.status === 401) {
          // do something with status code
          console.error('Status code error: ', error);
        } else {
          // handle some other type of runtime error (if possible)
          console.error('Runtime error: ', error);
        }
      }

      // Send records to the server, unless the user isn't logged in
      if (rootState.user.isLoggedIn === true) {
        payload.indices.map(index => (
          pushRecord(storedUrl, storedToken, rootState.farm.logs[index]) // eslint-disable-line no-use-before-define, max-len
            .then(res => handleSyncResponse(res, index))
            .catch(err => handleSyncError(err, index))
        ));
      } else {
        commit('setStatusText', 'Not logged in. Redirecting to login page...');
        // FIXME: This should probably done from within the client's AllObservations.vue,
        // but only after the login module's store has been reintegrated with client.
        payload.router.push('/login');
      }
    },

    /*
      called when the get photo button is tapped; setPhotoLoc sets the captured
      image URI to a variable in the store called photo_loc
    */
    getPhotoLoc({ commit }) {
      function handleResponse(photoLoc) {
        commit('setStatusText', `Took the following photo: ${photoLoc}`);
        commit('setPhotoLoc', photoLoc);
      }
      function handleError(error) {
        commit('setStatusText', `Error capturing photo: ${error}`);
      }
      getPhotoFromCamera() // eslint-disable-line no-use-before-define
        .then(handleResponse, handleError);
    },

  },
};

/*
  Helper funcitons called by actions.  Many of these helper functions
  execute SQL queries or AJAX requests.
*/

// Executes AJAX to send records to server
function pushRecord(url, token, log) {
  const loc = '/log';
  const logUrl = url + loc;
  const formattedLog = logFactory(log, SERVER);
  const requestHeaders = {
    'X-CSRF-Token': token,
    'Content-Type': 'application/json',
    Accept: 'json',
  };
  console.log(`PUSHING REQUEST URL : ${logUrl}`);
  console.log('RECORDS SENDING: ', JSON.stringify(formattedLog));
  return new Promise((resolve, reject) => {
    fetch(logUrl, {
      method: 'POST',
      headers: requestHeaders,
      credentials: 'include',
      body: JSON.stringify(formattedLog),
    }).then((response) => {
      console.log('fetch response: ', response);
      if (!response.ok) {
        throw response;
      }
      return response.json();
    }).then(resolve).catch(reject);
  });
}

// TODO: break out helper functions into separate module
function openDatabase() {
  return new Promise((resolve) => {
    console.log('opening database');
    // Check whether a local webSQL database exists.  If not, make it!
    const db = window.openDatabase('farmOSLocalDB', '1.0', 'farmOS Local Database', 200000);
    // window.openDatabase either opens an existing DB or creates a new one.
    resolve(db);
  });
}

// This function obtains the transaction object; it assumes the table is already created.
function getTX(db, table) {
  return new Promise((resolve, reject) => {
    function handleResponse(_tx, result) {
      console.log('Get TX success. Result: ', result);
      resolve(_tx);
    }
    function handleError(_tx, error) {
      console.log('Get TX error: ', error.message);
      // Reject will return the tx object in case you want to try again.
      reject(_tx);
    }
    db.transaction((tx) => {
      const sql = `CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, blankColumn TEXT)`;
      tx.executeSql(sql, null, handleResponse, handleError);
    });
  });
}


function makeTable(db, table, log) {
  return new Promise((resolve, reject) => {
    console.log(`making table with name ${table} and the following data template: ${JSON.stringify(log)}`);
    // Creates a table called 'tableName' in the DB if none yet exists
    db.transaction((tx) => {
      var fieldString = '';
      for (var i in log) { // eslint-disable-line guard-for-in, no-restricted-syntax
        var suffix = '';
        if (typeof i === "number" ){
          suffix = " INT, "
        } else {
          suffix = " VARCHAR(150), "
        }
        fieldString = fieldString+i+suffix;
      }
      //I need to trim the last two characters to avoid a trailing comma
      fieldString = fieldString.substring(0, fieldString.length - 2);

      //the id field will autoincrement beginning with 1
      var sql = "CREATE TABLE IF NOT EXISTS " +
      table +
      " ( local_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
      fieldString +
      ")";

      tx.executeSql(sql, null, function (_tx, result) {
        console.log('Make table success. Result: ', result);
        resolve(_tx);
      }, function (_tx, error) {
        console.log('Make table error: ' + error.message);
        // Reject will return the tx object in case you want to try again.
        reject(_tx);
      });

    });

  })
};

/*
saveRecord either saves a new record or updates an existing one.
If log contains a property called local_id, the database updates the record with that local_id
If log contains no local_id property, a new record is created!
Params:
tx - the database context
table - string name of the table, AKA logType
log - object following the template for that logType
*/

function saveRecord (tx, table, log) {
  return new Promise((resolve, reject) => {
    console.log('SAVING THE FOLLOWING RECORDS:');
    console.log(log);

    var fieldString = "";
    var queryString = "";
    var values = [];
    for (var i in log){
      fieldString = fieldString+i+", ";
      queryString = queryString+"?, ";
      values.push(log[i]);
    }
    //I need to trim the last two characters of each string to avoid trailing commas
    fieldString = fieldString.substring(0, fieldString.length - 2);
    queryString = queryString.substring(0, queryString.length - 2);


    console.log("add record strings")
    console.log(fieldString);
    console.log(queryString);
    console.log(values);

    //Set SQL based on whether the log contains a local_id fieldString
    var sql;
    sql = "INSERT OR REPLACE INTO " +
    table +
    " ("+fieldString+") " +
    "VALUES ("+queryString+")";
    //}
    //tx.executeSql(sql, [tableRecord.text, tableRecord.plantings, tableRecord.locations, tableRecord.livestock],
    tx.executeSql(sql, values, function (_tx, results) {
      console.log('INSERT success');
      resolve(results);
    }, function (_tx, error) {
      console.log('INSERT error: ' + error.message);
      reject(error.message)
    });

  })
};

function getRecords (db, table) {
  return new Promise(function(resolve, reject) {

    //This is called if the db.transaction obtains data
    function dataHandler(tx, results) {
      var resultSet = [];
      for(var i=0; i<results.rows.length; i++) {
        var row = results.rows.item(i)
        console.log('RAW GETRECORDS RESULT '+i+': '+JSON.stringify(row));
        resultSet.push(row);
      }
      resolve(resultSet)
      /*
      I'm not sure why, but the following line does not work in Cordova, though
      it does seem to work in the web app.  The resultSet code above replaces it.
      */
      //resolve([...results.rows]);

    }
    //This is called if the db.transaction fails to obtain data
    function errorHandler(tx, error) {
      console.log("No old logs found in cache.");
      resolve([]);
    }

    db.transaction(function (tx) {
      var sql = `SELECT * FROM ${table}`;

      tx.executeSql(sql, [],
        dataHandler,
        errorHandler
      );
    });
  })
}

/*
Utilizes the Cordova camera plugin to obtain an image URI
*/
function getPhotoFromCamera() {
  return new Promise((resolve, reject) => {
    console.log('GETTING IMAGE FROM CAMERA');

    function onSuccess(imageURI) {
      console.log(`RETRIEVED THE FOLLOWING IMAGE: ${imageURI}`);
      resolve(imageURI);
    }
    function onFail(message) {
      console.log(`FAILED TO RETRIEVE IMAGE BECAUSE: ${message}`);
      reject(message);
    }

    const options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI, // eslint-disable-line no-undef
    };
    navigator.camera.getPicture(onSuccess, onFail, options);
  });
}

/*
Turns an image URI into a base64 encoded file
Thanks to ourCodeWorld https://ourcodeworld.com/articles/read/80/how-to-convert-a-image-from-the-device-to-base64-with-javascript-in-cordova
*/
/*
TODO: This might need to be moved to logFactory.js when the time comes, or deleted.
It was only being used by formatState, which I removed after replacing it with logfactory
for formatting logs prior to sending them to the server. This may need to be replaced
too, since I don't think Alex ever got it to work, but it could be useful for reference
and could even gain new life if it turns out the problem was on the server-end, not here.
*/
function getFileContentAsBase64(path, callback) { // eslint-disable-line no-unused-vars
  function fail() {
    console.log('Cannot find requested file');
  }

  function gotFile(fileEntry) {
    fileEntry.file((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const content = this.result;
        callback(content);
      };
      // The most important point, use the readAsDatURL Method from the file plugin
      reader.readAsDataURL(file);
    });
  }

  window.resolveLocalFileSystemURL(path, gotFile, fail);
}
