import {logFactory} from './logFactory';

export default {

  actions: {

    createRecord ({commit, dispatch, rootstate}, newLog) {
      const tableName = newLog.type;
      const newRecord = logFactory(newLog);
      openDatabase()
      .then(function(db) {
        return makeTable(db, tableName, newRecord);
      })
      .then(function(tx) {
        return saveRecord(tx, tableName, newRecord)
      })
      .then(function(results) {
        // Can we be sure this will always be the CURRENT log?
        // Not if we use this action to add new records received from the server
        commit('updateCurrentLog', {
          local_id: results.insertId,
          isCachedLocally: true
        });
      })
    },

    loadCachedLogs({commit}, logType) {
      openDatabase()
      .then(function(db) {
        return getRecords(db, logType)
      })
      .then(function(results) {
        const cachedLogs = results.map(function(log) {
          return logFactory({
            ...log,
            isCachedLocally: true
          })
        });
        commit('addLogs', cachedLogs)
      })
      .catch(function(error) {
        console.error(error);
      })
    },

    updateRecord ({commit, rootState}, newProps) {
      const newLog = logFactory({
        ...rootState.farm.logs[rootState.farm.currentLogIndex],
        ...newProps
      });
      const table = newLog.type;
      openDatabase()
      .then(function(db) {
        return getTX(db, table);
      })
      .then(function(tx) {
        saveRecord(tx, table, newLog)
      })
      .then(function(tx, result) {
        // Can we be sure this will always be the CURRENT log?
        commit('updateCurrentLog', { isCachedLocally: true })
      })
    },


      //SEND RECORDS TO SERVER
      pushToServer ({commit, rootState}, props) {
        commit('setIsWorking', true)
        commit('setStatusText', "Sending record to server...")
        console.log("PUSHING TO SERVER:")
        var logObject = rootState.farm.logs[rootState.farm.currentLogIndex];
        console.log(JSON.stringify(logObject))

        var formattedLog = formatState(logObject);
          console.log("LOGS FORMATTED TO: ")
          console.log(JSON.stringify(formattedLog))
        pushRecords (props.url, props.token, formattedLog)
        .then( function (response) {
          console.log("PUSH TO SERVER SUCCESS: ")
          console.log(JSON.stringify(response))
          commit('setIsWorking', false)
          commit('setStatusText', "Sent to server successfully!")
        },
        function (error){
          console.log("PUSH TO SERVER ERROR: ")
          console.log(JSON.stringify(error))
          commit('setIsWorking', false)
          commit('setStatusText', "Error sending to server...")
        })//end then

      } //pushToServer

  } //actions
} //export default

/*Helper funcitons called by actions.  Many of these helper functions execute SQL queries */


// Outputs an object consisting of all records in state, formatted for farmOS
function formatState (currentLog) {

  var newLog = {};
  console.log('RAW LOG: ')
  console.log(JSON.stringify(currentLog))

  //newLog.field_farm_files = [];
//Proceed if log i was not pushed to Server
if (!currentLog.wasPushedToServer) {
  for (var j in currentLog) {

    switch(j) {
    case 'name':
        newLog.name = currentLog[j];
        break;
    case 'type':
        newLog.type = currentLog[j];
        break;
        //farmier returns '403 not authorized to set property timestamp'
        /*
    case 'timestamp':
        newLog.timestamp = currentLog[j];
        break;
        */
    case 'notes':
        newLog.field_farm_notes = {format: "farm_format", value: '<p>'+currentLog[j]+'</p>\n'};
        break;


    //default:
  } //end switch
} //end for j
}// end if log not pushed to server
console.log('NEW LOG: ')
console.log(JSON.stringify(newLog))
//Returning object in an array, per suggestion
return(newLog);


//from iOS
/*

        let toCompile = [
            "name": nameInput,
            "type": "farm_observation",
            //timestamp disabled for now
            //"timestamp": currentTimeString,
            "field_farm_notes": ["format": "farm_format", "value": bodyInput]
            //"field_farm_log_owner": [["id": currentUserId, "resource": "user", "uri": currentURI]],

            //Need to query assets and select from a list in order to construct links
            //"field_farm_asset": [["id": "2", "resource": "farm_asset", "uri": "http://www.beetclock.com/farmOS/?q=farm_asset/2"]]
            ] as! [String: AnyObject]
            */
} //end formatState

// Executes AJAX to send records to server
function pushRecords (url, token, records) {
  return new Promise(function(resolve, reject) {
  var loc = '/log'
  //var loc = '/?q=log'
  //var loc = '/log.json'
  //var loc = '/?q=log.json'
  var logUrl = url+loc

console.log('PUSHING REQUEST URL : '+logUrl)
console.log('RECORDS SENDING: '+JSON.stringify(records))

//var requestHeaders = {"X-CSRF-Token": token, "Content-Type":"application/json"};
//var requestHeaders = {"X-CSRF-Token": token, "Content-Type": "application/json", "Accept": "application/json"};
var requestHeaders = {"X-CSRF-Token": token, "Content-Type": "application/json", "Accept": "json"};
//var requestHeaders = {"X-CSRF-Token": token, "Content-Type": "application/hal+json", "Accept": "application/json"};

  $.ajax({
      type: 'POST',
      url: logUrl,
      headers: requestHeaders,
      //contentType: "application/json; charset=utf-8",
      data: JSON.stringify(records),
      //dataType:'json',
      success: function(response) {
          console.log('POST SUCCESS!!');
          resolve(response);
      },
      error: function(error) {
          console.log('POST ERROR...');
          reject(error);
      },
  }); //end ajax

}); // end promise
return submissionPromise;
}

function openDatabase () {
  return new Promise(function(resolve, reject) {
    //Here I am both opening the database and making a new table if necessary.

    console.log('opening database');
    //Check whether a local webSQL database exists.  If a local database does not yet exist, make it!
    const db = window.openDatabase("farmOSLocalDB", "1.0", "farmOS Local Database", 200000);
    // window.openDatabase either opens an existing DB or creates a new one.
    resolve(db);

  })
}

//This function obtains the tx database object.  It assumes the table has already been created.
function getTX(db, table) {
  return new Promise(function(resolve, reject) {
    db.transaction(function (tx) {

      var sql = "CREATE TABLE IF NOT EXISTS " +table +" (id INTEGER PRIMARY KEY AUTOINCREMENT, blankColumn TEXT)";

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

    console.log(`making table with name ${table} and the following data tempate: `, log);
    //Creates a table called 'tableName' in the DB if none yet exists
    db.transaction(function (tx) {
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
