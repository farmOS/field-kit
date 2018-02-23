<template>

<div>
  <h4>Test WebSQL database creation</h4>
  <div class="input-group">

<!-- This should all be handled by record input now
<button @click="openDB" class="btn btn-default" type="button" >Open Database!</button>

<button @click="makeTable" class="btn btn-default" type="button" >Make Table!</button>

<button @click="addRecord( {id: 0, name: 'No tomatoes', date: 1, notes: 'There are no tomatoes anywhere!'} )" class="btn btn-default" type="button" >Add Record 0!</button>
<button @click="addRecord( {id: 1, name: 'Tomaotes!!', date: 1, notes: 'OMG too many tomatoes!!'} )" class="btn btn-default" type="button" >Add Record 1!</button>
-->
<button @click="getRecords" class="btn btn-default" type="button" >Get Records!</button>
<br>
<!--When Get Records is pressed, display a list of text results-->
<li v-for="i in displayResults">
{{i}}
</li>

</div>
</div>

</template>

<script>
export default {
  props: ['newRecordCount', 'newRecord'],
  watch: {
  newRecordCount: { // watch newRecord to see when it increments
    handler: function(newVal, oldVal) {
      //Execute when changes are made
      console.log('newRecordCount changed: ', newVal, ' | was: ', oldVal);
      //Now add the new item to the DB
      this.openDB();
      //Passing values to makeTable to create a table with the appropriate fields
      this.makeTable(this.newRecord);
      //And then add records to the newly made table
      this.addRecord(this.newRecord);
    },
    //deep: true
  }
}, // end watch
  // name: 'Data',
  data () {
    return {
      rawResults: {},
      displayResults: []
    }
  }, // end data
//Do not currently need events
/*
  events: {
      retrievedRecord: function (resultString) {
          this.statusText = resultString;
        }
      }, //end events
*/

  methods: {

    openDB () {
      console.log('opening database');

    //Check whether a local webSQL database exists.  If a local database does not yet exist, make it!
    this.db = window.openDatabase("farmOSLocalDB", "1.0", "farmOS Local Database", 200000);
    // window.openDatabase either opens an existing DB or creates a new one.

    },

    makeTable (tableRecord) {
      console.log('making table');
    //Creates a table called 'tableName' in the DB if none yet exists

    this.db.transaction(
      function (tx) {
        //I will no longer start by eraising all preexisting records
          //tx.executeSql('DROP TABLE IF EXISTS observations');

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
              console.log('Create table success');
          },

          function (tx, error) {
              alert('Create table error: ' + error.message);
          });

      }); //end db.transaction and function tx

    }, // end makeTable

    addRecord (tableRecord) {
    //Add a new record (observation) to the local DB
    //Accepts an object with they following keys:
    //text, plantings, locations, livestock
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
            },

            function (tx, error) {
              console.log('INSERT error: ' + error.message);
            }
          );

        }//end function tx
      ); // end transaction

    }, //end addRecord

    getRecords () {
    //Get a record from the local DB by local ID.
    //This is an asynchronous callback.
    console.log('getting record');

    //I need to create a scope that functions within this method can reference
    var self = this;

    //I am avoiding using jQuery $.Deferred()
    //var deferred = $.Deferred();

    //This is called if the db.transaction obtains data
    function dataHandler(tx, results) {
      console.log(results);

      self.rawResults = results;

      for (var i = 0; i < results.rows.length; i++) {
      var oneResult = results.rows.item(i);
      var resultString = '';
      for (var j in oneResult){
        resultString = resultString+j+": "+oneResult[j]+", ";
      }
      //var resultString = "ID: "+firstResult.id+" TEXT: "+firstResult.text+" PLANTINGS: "+firstResult.plantings+" LOCATIONS: "+firstResult.locations+" LIVESTOCK: "+firstResult.livestock;
      console.log(resultString);
      //Set status text within the newly created self scope
      self.displayResults.push(resultString);
      } //end results for
      //deferred.resolve(resultString);
    }

    //This is called if the db.transaction fails to obtain data
    function errorHandler(tx, error) {
      console.log('INSERT error: ' + error.message);

      //deferred.reject("Transaction Error: " + error.message);
    }

    this.db.transaction(

    function (tx) {
      // String together all record fields, with id as the first
        var queryString = '';
        for (var i in self.newRecord){
          queryString = queryString+i+", "
        }
        // And trim the last two characters to avoid a syntax error
        queryString = queryString.substring(0, queryString.length - 2);

        var sql = "SELECT " +
            queryString +
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

  } //end getRecord
  }//methods
} // end export
</script>


<style scoped>

</style>
