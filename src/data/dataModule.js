import logTemplates from './logTemplates';

export default {
  state: {
    logs: {observations: {}},
    didCreateDB: false
  },
  mutations: {
    /*
      Accepts an object payload consisting of logType (a string) and log (an object)
    */
    addUnsyncedLogsToState(state, payload) {
      var logs = payload.log;
      var logType = payload.logType;
      console.log('ADDING UNSYNCED LOGS:');
      console.log(logs);
      console.log('OF TYPE:');
      console.log(logType)
      state.logs[logType] = logs;
      console.log('THIS IS THE STATE OF OBSERVATIONS');
      console.log(state.logs.observations);
    },
    toggleCreatedDB (state) {
      state.didCreateDB = true;
    }
  },
  actions: {

    /*
    getAll obtains all records from the database and loads them into the application state as logs{}
    it requires a simple string parameter - logType.  logType must be one of the types included in logTemplates.js
     */
    getAll ({commit, state}, logType) {
      //getAll will be called by other actions, so I am wrapping it in a Promise
      //getAll must also be able to read state, because it needs to create a table based on existing templates
    return new Promise(function(resolve, reject) {

      var log = {};
      console.log('HERE IS STATE.LOGS:')
      console.log(state.logs)

      for (var i in state.logs){
        if (i.hasOwnProperty(logType)) {
              log = i;
              console.log('LOGS SET TO:');
              console.log(log);
        }
      }

      openDatabase()
      .then(function(db) {
        return getTX(db, logType);
      })
      .then(function(tx) {
        return getLogs(tx, logType);
        console.log('LOGS OBTAINED AND RETURNED');
      })
      .then(function(results) {
        console.log('This is the form data:');
        console.log(results);
        commit('addUnsyncedLogsToState', {logType:logType, log:results});

        resolve(results);
      })

    })//end promise
    },// end getAll

    /*
    makeLog is called by the UI with a payload of input provided by the user
    it packages the values into farmOS format and saves them to the database.
    the payload is an object with log and logType properties
    log is an object containing of string values.  logType is a simple string.
    */

    makeLog ({commit, dispatch, state}, payload) {

      //Unpacking the payload into log and table
      const log = payload.log;
      console.log('MAKELOG CALLED WITH LOG:');
      console.log(log);
      const table = payload.logType;

      var rawTemplates = logTemplates.rawTemplates;
      //Open the template for the log type.  For each template property matching a property in log, write log values into template
      for (var rawProp in rawTemplates) {
        if( rawTemplates.hasOwnProperty(rawProp) && table === rawProp) {
          var logFull = rawTemplates[rawProp]
          for (var rawSubProp in logFull) {
            for (var logItem in log){
              if (logItem === rawSubProp) {
                  //Write a new value to template
                  //Use parseProp, isObject and isArray to append prefix and suffix where needed to achieve farmOS format
                  var oneProp = log[logItem];
                  //if (isObject(oneProp) || isArray(oneProp)){
                    oneProp = JSON.stringify(oneProp)
                //  }
                  logFull[rawSubProp] = parseProp(table, logItem, oneProp);
              }
            } // end for log
          }// end for rawSubProp

          //Before adding to database, we must modify the template by deleting ID and adding synced
          delete logFull.id;
          logFull.synced = false;
          console.log('MODIFIED LOG TO SAVE:')
          console.log(logFull)


          openDatabase()
          .then(function(db) {
            return getTX(db, table)
          })
          .then(function(tx) {
            saveRecord(tx, table, logFull)
          })
          .then(function() {
            dispatch('getAll', table)
          })

        }//if hasOwn
      }//for rawProp

    }, //end makeLog

    // Push records to farmOS via REST API.
    pushRecords () {
      // AJAX request...
    },

    /*
    loadCachedLogs creates tables based on all log templates stored in logTemplates.js
    It also loads the values from each template into the newly created tables
    logTemplates.rawTemplates contains properly formatted logs of each possible type
    These correspond to the expected raw server output for each log type
    */

    loadCachedLogs({commit, dispatch, state}) {

      var rawTemplates = logTemplates.rawTemplates;
      console.log('RAW TEMPLATES');
      console.log(rawTemplates);

      //Iterating through raw data template, obtaining keys and values for each property
      for (var rawProp in rawTemplates) {
        if( rawTemplates.hasOwnProperty(rawProp) ) {

          var tableName = rawProp;
          const payload = () => {
          var payLoadBuilder = {};

          for (var rawSubProp in rawTemplates[rawProp]) {

            var rawKey = rawSubProp;
            var parsedValue = rawTemplates[rawProp][rawSubProp];
          //  if (isObject(parsedValue) || isArray(parsedValue)){
              parsedValue = JSON.stringify(parsedValue);
          //  }
            var testObject = isObject(parsedValue);
            var testArray = isArray(parsedValue);

            payLoadBuilder[rawKey] = parsedValue;

          }// end sub raw

          return payLoadBuilder;
          } //end payload

          var modPayload = payload();
          delete modPayload.id;
          modPayload.synced = false;
          console.log('MODIFIED PAYLOAD:')
          console.log(modPayload)

          //And finally, we can go ahead and add the payload to the state
          if (!state.didCreateDB) {
            openDatabase()
              .then(function(db) {
                  return makeTable(db, tableName, modPayload);
            })
            .then(function(tx) {
              saveRecord(tx, tableName, modPayload);
            })
            .then(function(){
              commit('addUnsyncedLogsToState', {logType:tableName, log:{payload()}});
              // set didCreateDB to true
              commit('toggleCreatedDB');
            })
          }// end if !didCreateDB

        }//end if has raw
      }//end for var raw
    }, //end loadCachedLogs

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

//This function obtains the tx database object.  It assumes the table has already been created.
function getTX(db, table) {
  return new Promise(function(resolve, reject) {
    db.transaction(function (tx) {

      var sql = "CREATE TABLE IF NOT EXISTS " +table +" (id INTEGER PRIMARY KEY AUTOINCREMENT, blankColumn TEXT)";

      console.log("tx instance from getTX(): ", tx);
      tx.executeSql(sql, null, function (_tx, result) {
        console.log('Get TX success. Result: ', result);
        resolve(_tx);

      }, function (_tx, error) {
        console.log('Get TX error: ' + error.message);
        // Reject will return the tx object in case you want to try again.
        reject(_tx);
      });

    }) //end db.transaction
  }) //end promise
} //end getTable


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

      var fieldString = '';
      for (var i in log){
        var suffix = "";
        if (typeof i === "number" ){
          suffix = " INT, "
        } else {
          suffix = " VARCHAR(150), "
        }
        fieldString = fieldString+i+suffix;
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
      "FROM " +
      logType;

      tx.executeSql(sql, [], function (_tx, results) {
        console.log('GET LOG success');
        console.log(results);

        //This function strings all result objects into an array, and returns the array.
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

/*
  Appends a prefix and suffix to certain object property values
  This allows us to store records in the data format required by farmOS
*/
function parseProp(logType, key, value){
  var parsedValue = '';
  var propTemplates = logTemplates.propTemplates;
  for (var prop in propTemplates){
    if (propTemplates.hasOwnProperty(prop) && prop === logType) {
    var typeTemplate = propTemplates[prop];
    for (var subProp in typeTemplate){
      if (subProp === key) {
        var propTemplate = typeTemplate[subProp];
        parsedValue = propTemplate.prefix+String(value)+propTemplate.suffix;
        console.log('PARSED THE FOLLOWING:')
        console.log(parsedValue)
        return parsedValue;
      }
    }
  }// end if equals
  }// end for propTemplates
  return value;
}

/*
Tests whether a string can be converted to a key:value object
This will be used in interpreting results of database queries
*/
function isObject(string) {
  var value;
  try {
    value = JSON.parse(string);
  } catch (e) {
    return false;
  }
  if(value && typeof value === 'object' && value.constructor === Object) {
    return true;
  } else {
    return false;
  }
}

/*
Tests whether a string can be converted to an array with more than 0 entries
This will be used in interpreting results of database queries
*/
function isArray(string) {
  var value;
  try {
    value = JSON.parse(string);
  } catch (e) {
    return false;
  }
  if (value && typeof value === 'object' && value.constructor === Array) {
    if (value.length > 0) {
      return true;
    } else {
    return false;
    }
  } else {
    return false;
  }
}
