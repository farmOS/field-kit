export default {
  state: {
    logs: [],
    assets: [],
    currentLogIndex: 0,
  },

  mutations: {
    addCachedLogs(state, payload) {
      const cachedLogs = payload.map(function(cachedLog) {
        return logFactory({
          ...cachedLog,
          isCachedLocally: true
        })
      })
      state.logs = state.logs.concat(cachedLogs);
    },
    addLogAndMakeCurrent(state, newLog) {
      state.currentLogIndex = state.logs.push(newLog) -1;
    },
    updateCurrentLog (state, newProperty) {
      state.logs[state.currentLogIndex][newProperty.key] = newProperty.val
    },
  },

  actions: {

    initializeLog({commit, rootState}, logType) {
      // TODO: The User ID will also be needed to sync with server
      const newLog = logFactory({
        type: logType,
        name: rootState.user.name ? rootState.user.name : '',
        timestamp: Math.floor(Date.now() / 1000).toString()
      })
      commit('addLogAndMakeCurrent', newLog);
    },

    loadCachedLogs({commit}, logType) {
      openDatabase()
      .then(function(db) {
        return getRecords(db, logType)
      })
      .then(function(result) {
        commit('addCachedLogs', result)
      })
      .catch(function(error) {
        console.error(error);
      })
    },

    recordObservation ({commit}, obs) {

      // Pass this in to set the table name
      const table = obs.type;

      openDatabase()
      .then(function(db) {
        return makeTable(db, table, obs)
      })
      .then(function(tx) {
        saveRecord(tx, table, obs)
      })
    },
  }
}

function openDatabase () {
  return new Promise(function(resolve, reject) {
    //Here I am both opening the database and making a new table if necessary.

    console.log('opening database');
    //Check whether a local webSQL database exists.  If a local database does not yet exist, make it!
    const db = window.openDatabase("farmOSLocalDB", "1.0", "farmOS Local Database", 200000);
    // window.openDatabase either opens an existing DB or creates a new one.
    console.log("db instance from openDatabase(): ", db);
    resolve(db);

  })
}

function makeTable(db, table, tableRecord) {
  return new Promise(function(resolve, reject) {
    db.transaction(function (tx) {
      // JG: commenting this out. Don't we want to keep these records?
      // tx.executeSql(`DROP TABLE IF EXISTS ${table}`);

      var fieldString = "";
      for (var i in tableRecord){
        fieldString = fieldString+i+" VARCHAR(50), ";
      }
      //I need to trim the last two characters to avoid a trailing comma
      fieldString = fieldString.substring(0, fieldString.length - 2);

      //the id field will autoincrement beginning with 1
      var sql = "CREATE TABLE IF NOT EXISTS " +
      table +
      " ( id INTEGER PRIMARY KEY AUTOINCREMENT, " +
      /*"text VARCHAR(50), " +
      "plantings VARCHAR(50), " +
      "locations VARCHAR(50), " +
      "livestock VARCHAR(50) " + */
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
}

// Save a log to the local database.
function saveRecord (tx, table, tableRecord) {
  var fieldString = "";
  var queryString = "";
  var values = [];
  for (var i in tableRecord){
    fieldString = fieldString+i+", ";
    queryString = queryString+"?, ";
    values.push(tableRecord[i]);
  }
  //I need to trim the last two characters of each string to avoid trailing commas
  fieldString = fieldString.substring(0, fieldString.length - 2);
  queryString = queryString.substring(0, queryString.length - 2);

  //I am going to try skipping the id field, and see if it autoincrements
  var sql = "INSERT OR REPLACE INTO " +
  table +
  " ("+fieldString+") " +
  "VALUES ("+queryString+")";

  //tx.executeSql(sql, [tableRecord.text, tableRecord.plantings, tableRecord.locations, tableRecord.livestock],
  tx.executeSql(sql, values, function () {
    console.log('INSERT success');
  }, function (_tx, error) {
    console.log('INSERT error: ' + error.message);
  });
}

function getRecords (db, table) {
  return new Promise(function(resolve, reject) {

    //This is called if the db.transaction obtains data
    function dataHandler(tx, results) {
      resolve([...results.rows]);
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

// A helper function for creating new log items with default properties
// TODO: a User ID will also be needed to sync with server
function logFactory ({
  id = null,
  local_id = null,
  type = '',
  name = '',
  timestamp = '',
  notes = '',
  quantity = '',
  isCachedLocally = false,
  isSyncedWithServer = false,
} = {}) {
  return {
    id,
    local_id,
    type,
    name,
    timestamp,
    notes,
    quantity,
    isCachedLocally,
    isSyncedWithServer,
  }
}
