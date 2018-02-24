import testObs from './testObs';

export default {
  state: {
    test: 'this is some test state',
    logs: [],
    areas: [],
    assets: [],
    dbReady: false,
    logCount: 0
  },
  mutations: {
    changeTestState (state, msg) {
      state.test = msg;
    },
    dbIsReady (state) {
      state.dbReady = true;
    },
    iterateLogCount (state) {
      state.logCount++;
    },
    addUnsyncedLogsToState(state, payload) {
      state.logs = state.logs.concat(payload);
    }
  },
  actions: {

    changeTestState ({commit}, msg) {
      commit('changeTestState', msg);
    },

    loadCachedLogs({commit}) {
      // Maybe some WebSQL Queries could happen here instead?
      const payload = () => {
        return {
          id: testObs.id,
          name: testObs.name,
          uid: testObs.uid,
          timestamp: testObs.timestamp,
          notes: testObs.field_farm_notes,
          synced: false
        }
      };
      commit('addUnsyncedLogsToState', payload())
    },

/*
Begin WebSQL actions
*/

makeTable ({commit}, tableRecord) {
//Here I am both opening the database and making a new table if necessary.

  console.log('opening database');

//Check whether a local webSQL database exists.  If a local database does not yet exist, make it!
this.db = window.openDatabase("farmOSLocalDB", "1.0", "farmOS Local Database", 200000);
// window.openDatabase either opens an existing DB or creates a new one.

      console.log('making table');
    //Creates a table called 'tableName' in the DB if none yet exists

      console.log('with the following data template:');
      console.log(tableRecord);

    this.db.transaction(
      function (tx) {
        //I will start by eraising all preexisting records
          tx.executeSql('DROP TABLE IF EXISTS observations');

          var fieldString = "";
          for (var i in tableRecord){
            fieldString = fieldString+i+" VARCHAR(50), ";
          }
          //I need to trim the last two characters to avoid a trailing comma
          fieldString = fieldString.substring(0, fieldString.length - 2);

          console.log("create table strings")
          console.log(fieldString);

          //the id field will autoincrement beginning with 1
          var sql = "CREATE TABLE IF NOT EXISTS " +
          "observations " +
          "( id INTEGER PRIMARY KEY AUTOINCREMENT, " +
          /*"text VARCHAR(50), " +
          "plantings VARCHAR(50), " +
          "locations VARCHAR(50), " +
          "livestock VARCHAR(50) " + */
          fieldString +
          ")";

          tx.executeSql(sql, null,
          function () {
              console.log('Make table success');
              commit('dbIsReady');
          },

          function (tx, error) {
              console.log('Make table error: ' + error.message);
          });

      }); //end db.transaction and function tx

    }, // end makeTable


    // Save a log to the local database.
    saveLog ({commit}, tableRecord) {
      console.log('adding record');

  this.db.transaction(
    function (tx) {

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

      console.log("add record strings")
      console.log(fieldString);
      console.log(queryString);
      console.log(values);

      //I am going to try skipping the id field, and see if it autoincrements
      var sql = "INSERT OR REPLACE INTO " +
          "observations " +
          "("+fieldString+") " +
          "VALUES ("+queryString+")";

          /*
          "(text, plantings, locations, livestock) " +
          "VALUES (?, ?, ?, ?)";
          */

      //tx.executeSql(sql, [tableRecord.text, tableRecord.plantings, tableRecord.locations, tableRecord.livestock],
tx.executeSql(sql, values,
        function () {
          console.log('INSERT success');
          commit('iterateLogCount');
        },

        function (tx, error) {
          console.log('INSERT error: ' + error.message);
        }
      );

    }//end function tx
  ); // end transaction

}, //end action saveLog

getLogs ({commit}, tableRecord) {

  //Get a record from the local DB by local ID.
      //This is an asynchronous callback.
      console.log('getting record');

      //I am avoiding using jQuery $.Deferred()
      //var deferred = $.Deferred();

      //This is called if the db.transaction obtains data
      function dataHandler(tx, results) {
        console.log(results);

        //Create an array to populate with result strings
        //Each string consists of all data from a single DB row
        var displayResults = [];

        for (var i = 0; i < results.rows.length; i++) {
        var oneResult = results.rows.item(i);
        var resultString = '';
        for (var j in oneResult){
          resultString = resultString+j+": "+oneResult[j]+", ";
        }
        //var resultString = "ID: "+firstResult.id+" TEXT: "+firstResult.text+" PLANTINGS: "+firstResult.plantings+" LOCATIONS: "+firstResult.locations+" LIVESTOCK: "+firstResult.livestock;
        console.log(resultString);
        //Set status text within the newly created self scope
        displayResults.push(resultString);
        } //end results for
        //deferred.resolve(resultString);

        commit('addUnsyncedLogsToState', displayResults);
      }

      //This is called if the db.transaction fails to obtain data
      function errorHandler(tx, error) {
        console.log('INSERT error: ' + error.message);

        //deferred.reject("Transaction Error: " + error.message);
      }

      this.db.transaction(

      function (tx) {
        //Disabling query, and simply returning all records
        /*
        // String together all record fields, with id as the first
          var queryString = '';
          for (var i in tableRecord){
            queryString = queryString+i+", "
          }
          // And trim the last two characters to avoid a syntax error
          queryString = queryString.substring(0, queryString.length - 2);
          console.log('Querying the following DB records:');
          console.log(queryString);
          */
          var sql = "SELECT " +
              " * " +
              //queryString +
              "FROM " +
              "observations ";
              //"WHERE id=? ";

              tx.executeSql(sql, [],
          //tx.executeSql(sql, [idToGet],
            //I am bringing the dataHandler and errorHandler functions outside of this.db.transaction
            dataHandler,
            errorHandler
          ); //end executeSql
        } // end function tx
      ); //end this.db.transaction

      //return deferred.promise();
}, //end action getLogs


    // Push records to farmOS via REST API.
    pushRecords () {
      // AJAX request...
    },
  }
}
