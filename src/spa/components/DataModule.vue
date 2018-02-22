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
<button @click="getRecord(1)" class="btn btn-default" type="button" >Get Record 1!</button>
<br>
<p>{{statusText}}</p>

</div>
</div>

</template>

<script>
export default {
  props: ['newRecord'],
  watch: {
  newRecord: function(newVal, oldVal) { // watch for changes in newRecord
    console.log('newRecord changed: ', newVal, ' | was: ', oldVal);
    //Now add the new item to the DB
    this.openDB();
    this.makeTable();
    this.addRecord(newVal);
  }
}, // end watch
  // name: 'Data',
  data () {
    return {
      statusText: 'Placeholder text'
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

    makeTable () {
      console.log('making table');
    //Creates a table called 'tableName' in the DB if none yet exists

    this.db.transaction(
      function (tx) {
        //I'm going to start by eraising all preexisting records
          tx.executeSql('DROP TABLE IF EXISTS observations');

          //the id field will autoincrement beginning with 1
      var sql = "CREATE TABLE IF NOT EXISTS " +
          "observations " +
          "( id INTEGER PRIMARY KEY AUTOINCREMENT, " +
          "text VARCHAR(50), " +
          "plantings VARCHAR(50), " +
          "locations VARCHAR(50), " +
          "livestock VARCHAR(50) )";

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

          //I am going to try skipping the id field, and see if it autoincrements
          var sql = "INSERT OR REPLACE INTO " +
              "observations " +
              "(text, plantings, locations, livestock) " +
              "VALUES (?, ?, ?, ?)";

          tx.executeSql(sql, [tableRecord.text, tableRecord.plantings, tableRecord.locations, tableRecord.livestock],

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

    getRecord (idToGet) {
    //Get a record from the local DB by local ID.
    console.log('getting record');

    //I should learn more about what I'm doing here with resolve, reject, promise
    var deferred = $.Deferred();

    this.db.transaction(

    function (tx) {

        var sql = "SELECT id, text, plantings, locations, livestock " +
            "FROM " +
            "observations " +
            "WHERE id=? ";

        tx.executeSql(sql, [idToGet],
          function (tx, results) {
            console.log(results);
            var firstResult = results.rows.item(0);
            resultString = "ID: "+firstResult.id+" TEXT: "+firstResult.text+" PLANTINGS: "+firstResult.plantings+" LOCATIONS: "+firstResult.locations+" LIVESTOCK: "+firstResult.livestock;
            console.log(resultString);
            deferred.resolve(resultString);
          },
          function (tx, error) {
            console.log('INSERT error: ' + error.message);
            deferred.reject("Transaction Error: " + error.message);
          }
        ); //end executeSql
      } // end function tx
    ); //end this.db.transaction

    //!!!
    //Why does this not display??
    this.statusText = deferred.promise();
  } //end getRecord
  }//methods
} // end export
</script>


<style scoped>

</style>
