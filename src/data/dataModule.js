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
    }
  },
  actions: {

    /* Actions are called directly from the SPA.  I am passing 'state' as a param to these
    actions to give them access to the store */

    getAll ({commit}, payload) {
//getAll will be called by other actions, so I am wrapping it in a Promise
//getAll must also be able to read state, because it needs to create a table based on existing templates
return new Promise(function(resolve, reject) {

  //Unpacking the payload into log and table
  const log = payload.log;
  const table = payload.logType;

      openDatabase()
      .then(function(db) {
        return makeTable(db, table, log)
      })
      .then(function(tx) {
        return getLogs(tx, table)
        console.log('LOGS OBTAINED AND RETURNED')
      })
      .then(function(results) {
        console.log('This is the form data:');
        console.log(results);

        commit('addUnsyncedLogsToState', results)

        resolve(results);
      })

    })//end promise
    },

    makeLog ({commit}, payload) {

      //Unpacking the payload into log and table
      const log = payload.log;
      const table = payload.logType;

      openDatabase()
      .then(function(db) {
        return makeTable(db, table, log)
      })
      .then(function(tx) {
        saveRecord(tx, table, log)
      })

    }, //end makeLog

    // Push records to farmOS via REST API.
    pushRecords () {
      // AJAX request...
    },

    loadCachedLogs({commit, dispatch}) {
      //loadCachedLogs will get data from test-obs.js, save it to the database IF no logs exist, then dispatch getAll
      // Maybe some WebSQL Queries could happen here instead?
      const payload = () => {
        return {
          id: testObs.id,
          name: testObs.name,
          //uid: testObs.uid,
          timestamp: testObs.timestamp,
          notes: testObs.field_farm_notes.value,
          synced: false
        }
      };
      //Local state will have to hold a copy that lacks the id
      var payloadNoId = payload();
      delete payloadNoId.id;

            dispatch('getAll', {log: payloadNoId, logType: 'observations'})
            .then(function(gotResults) {
              console.log('GOT RESULTS')
              console.log(gotResults)
              if (gotResults.length === 0) {
                openDatabase()
                  .then(function(db) {
                      return makeTable(db, 'observations', payloadNoId);
                })
                .then(function(tx) {
                  saveRecord(tx, 'observations', payloadNoId);
                })
                .then(function(){
                  commit('addUnsyncedLogsToState', [payload()]);
                })
              } //end if getResults
          }) //end dispatch then

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

function getLogs (tx, logType) {
  return new Promise(function(resolve, reject) {
    //Get a record from the local DB by local ID.
    //This is an asynchronous callback.
    console.log('getting record');

      var sql = "SELECT " +
      " * " +
      //queryString +
      "FROM " +
      logType;
      //"observations ";
      //"WHERE id=? ";

      tx.executeSql(sql, [], function (_tx, results) {
        console.log('GET LOG success');
        console.log(results);

        //This function each result object into an array, and returns the array.
        var allResults = [];

        for (var i = 0; i < results.rows.length; i++) {
          var oneResult = results.rows.item(i);
          allResults.push(oneResult);
        } // end results

        resolve(allResults)
      }, function (_tx, error) {
        console.log('INSERT error: ' + error.message);
      });

  })
}
