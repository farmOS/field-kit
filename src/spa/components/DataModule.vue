<template>

<div>
  <h4>Test WebSQL database creation</h4>
  <div class="input-group">

<button @click="openDB" class="btn btn-default" type="button" >Open Database!</button>

<button @click="makeTable" class="btn btn-default" type="button" >Make Table!</button>

<button @click="addRecord( {id: 0, name: 'No tomaotes', date: 1, notes: 'There are no tomatoes anywhere!'} )" class="btn btn-default" type="button" >Add Record!</button>

<button @click="getRecord" class="btn btn-default" type="button" >Get Record!</button>

</div>
</div>

</template>

<script>
export default {
  // name: 'Data',
  data () {
    return {
      db: ''
    }
  },
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

    //I don't want to drop an existing table in this function.
    //tableName.executeSql('DROP TABLE IF EXISTS employee');

    this.db.transaction(
      function (tx) {

      var sql = "CREATE TABLE IF NOT EXISTS " +
          "observations " +
          "( id INTEGER PRIMARY KEY AUTOINCREMENT, " +
          "name VARCHAR(50), " +
          "date INTEGER, " +
          "notes VARCHAR(50) )";

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
    //id, name, date, notes

    console.log('adding record');

      this.db.transaction(
        function (tx) {

          //I am going to try skipping the id field, and see if it autoincrements
          var sql = "INSERT OR REPLACE INTO " +
              "observations " +
              "(id, name, date, notes) " +
              "VALUES (?, ?, ?, ?)";

          tx.executeSql(sql, [tableRecord.id, tableRecord.name, tableRecord.date, tableRecord.notes],

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

    getRecord () {
    //Get a record from the local DB by local ID.

    console.log('getting record');

    //Won't use this yet
    //var deferred = $.Deferred();

    this.db.transaction(

    function (tx) {

        var sql = "SELECT id, name, date, notes " +
            "FROM " +
            "observations " +
            "WHERE id=? ";

        tx.executeSql(sql, [0],
          function (tx, results) {
            console.log(results);
            var firstResult = results.rows.item(0);
            console.log("ID: "+firstResult.id+" NAME: "+firstResult.name+" DATE: "+firstResult.date+" NOTES: "+firstResult.notes);
          },
          function (tx, error) {
            console.log('INSERT error: ' + error.message);
          }
        ); //end executeSql
      } // end function tx

    ); //end this.db.transaction


  } //end getRecord
  }//methods
} // end export
</script>


<style scoped>

</style>
