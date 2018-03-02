import testObs from './testObs';

export default {
  state: {
    test: 'this is some test state',
    logs: {observations: []},
    areas: [],
    assets: [],
    logCount: 0
  },
  mutations: {
    changeTestState (state, msg) {
      state.test = msg;
    },
    iterateLogCount (state) {
      state.logCount++;
    },
    addUnsyncedLogsToState(state, payload) {
      //This mutation currently receives one simple object
      console.log('adding this');
      console.log(payload);
      console.log('to this state');
      console.log(state);

      state.logs.observations = payload;

      //state.logs = state.logs.observations.concat(payload);
      /*for (var i in payload) {
      state.logs = state.logs.observations.concat(i);
    } // end payload for */
    }
  },
  actions: {

    /* Actions are called directly from the SPA.  I am passing 'state' as a param to these
    actions to give them access to the store */

    getAll ({commit}, logType) {
      openDatabase()
      /* getAll uses the promise callback structure.  When onFulfilled of openDatabase
      is called, getLogs is called with the .then trigger.  The value returned by onFulfilled
      of getLogs is then committed via the addUnsynchedLogsToState mutation */
      .then(function(db) {
        return getLogs(db, logType)
      })
      .then(function(results) {
        console.log('This is the form data:');
        console.log(results);

        commit('addUnsyncedLogsToState', results)
        // The results being passed to addUnsyncedLogsToState are currently a simple object.
      })
    },

    makeLog ({commit}, log) {

      // Pass this in to set the table name
      const table = 'observations';


      openDatabase()
      .then(function(db) {
        return makeTable(db, table, log)
      })
      .then(function(tx) {
        saveRecord(tx, table, log)
      })
      //saveRecord(tx, table, log);

    }, //end makeLog

    // Push records to farmOS via REST API.
    pushRecords () {
      // AJAX request...
    },

    loadCachedLogs({commit}) {
      // Maybe some WebSQL Queries could happen here instead?

      //Temporarily converting timestamp and synced to string; find my way around this later.
      const payload = () => {
        return {
          id: Number(testObs.id),
          name: testObs.name,
          //uid: testObs.uid,
          timestamp: String(testObs.timestamp),
          notes: testObs.field_farm_notes.value,
          synced: String(false)
        }
      };
      //Local state will have to hold a copy that lacks the id
      var payloadNoId = payload();
      delete payloadNoId.id;

            openDatabase()
            .then(function(db) {
              return makeTable(db, 'observations', payloadNoId);
            })
            .then(function(tx) {
              saveRecord(tx, 'observations', payloadNoId);
            })
            .then(function() {
              console.log('this the unsynced log added to state');
              console.log(payload());
              commit('addUnsyncedLogsToState', payload());
            })

    }, //end loadCachedLogs

    changeTestState ({commit}, msg) {
      commit('changeTestState', msg);
    },
  } //end actions
} //end export default

/*Helper funcitons called by actions.  Many of these helper functions execute SQL queries */

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

function makeTable(db, table, log) {
  return new Promise(function(resolve, reject) {
    console.log("db instance from makeTable", db);
    console.log('making table with name');
    console.log(table);
    //Creates a table called 'tableName' in the DB if none yet exists

    console.log('with the following data template:');
    console.log(log);
    db.transaction(function (tx) {

      //Start by eraising all preexisting records
      //tx.executeSql(`DROP TABLE IF EXISTS `+table);
      //console.log('Dropping table if exists:');
      //console.log(table);
      //tx.executeSql(`DROP TABLE IF EXISTS ${table}`);

      var fieldString = "";
      for (var i in log){
        fieldString = fieldString+i+" VARCHAR(50), ";
      }
      //I need to trim the last two characters to avoid a trailing comma
      fieldString = fieldString.substring(0, fieldString.length - 2);

      console.log("create table strings")
      console.log(fieldString);

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

      console.log("tx instance from makeTable(): ", tx);
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
function saveRecord (tx, table, log) {
  console.log("tx instance from saveRecord(): ", tx);
  console.log('adding record');
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

  //I am going to try skipping the id field, and see if it autoincrements
  var sql = "INSERT OR REPLACE INTO " +
  table +
  " ("+fieldString+") " +
  "VALUES ("+queryString+")";

  //tx.executeSql(sql, [tableRecord.text, tableRecord.plantings, tableRecord.locations, tableRecord.livestock],
  tx.executeSql(sql, values, function () {
    console.log('INSERT success');
    // commit('iterateLogCount');
  }, function (_tx, error) {
    console.log('INSERT error: ' + error.message);
  });
}

function getLogs (db, logType) {
  return new Promise(function(resolve, reject) {
    //Get a record from the local DB by local ID.
    //This is an asynchronous callback.
    console.log('getting record');

    //This is called if the db.transaction obtains data
    function dataHandler(tx, results) {
      console.log(results);


      var displayResults = [];

      for (var i = 0; i < results.rows.length; i++) {
        var oneResult = results.rows.item(i);

        //I am adding result objects to the state, not strings.
        /*
        //Create an array to populate with result strings
        //Each string consists of all data from a single DB row
        var resultString = '';
        for (var j in oneResult){
          resultString = resultString+j+": "+oneResult[j]+", ";
        }
        //var resultString = "ID: "+firstResult.id+" TEXT: "+firstResult.text+" PLANTINGS: "+firstResult.plantings+" LOCATIONS: "+firstResult.locations+" LIVESTOCK: "+firstResult.livestock;
        console.log("resultString", resultString);
        //Set status text within the newly created self scope
        displayResults.push(resultString);
        */
      } // end results
      //resolve(displayResults);




      //Right now, this should only return the last DB row

      resolve(oneResult)
      //These results will are passed to addUnsynchedLogsToState via getAll
    }

    //This is called if the db.transaction fails to obtain data
    function errorHandler(tx, error) {
      reject('INSERT error: ' + error.message);

      //deferred.reject("Transaction Error: " + error.message);
    }

    db.transaction(function (tx) {
      //Disabling query, and simply returning all records
      // // String together all record fields, with id as the first
      // var queryString = '';
      // for (var i in tableRecord){
      //   queryString = queryString+i+", "
      // }
      // // And trim the last two characters to avoid a syntax error
      // queryString = queryString.substring(0, queryString.length - 2);
      // console.log('Querying the following DB records:');
      // console.log(queryString);
      var sql = "SELECT " +
      " * " +
      //queryString +
      "FROM " +
      logType;
      //"observations ";
      //"WHERE id=? ";

      tx.executeSql(sql, [],
        //tx.executeSql(sql, [idToGet],
        //I am bringing the dataHandler and errorHandler functions outside of this.db.transaction
        dataHandler,
        errorHandler
      );
    });
  })
}
