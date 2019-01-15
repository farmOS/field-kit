import logFactory, { STORE, SQL } from './logFactory';

export default {

  actions: {

    createLog({ commit }, newLog) {
      const tableName = 'log';
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

    loadCachedLogs({ commit }) {
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getRecords(db, 'log')) // eslint-disable-line no-use-before-define
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

    updateLog({ commit, rootState }, newProps) {
      const newLog = logFactory({
        ...rootState.farm.logs[rootState.farm.currentLogIndex],
        ...newProps,
      }, SQL);
      const table = 'log';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, table)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, table, newLog)) // eslint-disable-line no-use-before-define
        // Can we be sure this will always be the CURRENT log?
        .then(() => commit('updateCurrentLog', { isCachedLocally: true }));
    },

    deleteLog(_, { local_id, type, name }) { // eslint-disable-line camelcase
      // delete record from WebSQL
      console.log(
        'deleteRecord() action dispatched on ',
        name,
      );
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, type)) // eslint-disable-line no-use-before-define
        .then(tx => deleteRecord(tx, 'log', local_id)) // eslint-disable-line no-use-before-define
        .then(console.log)
        .catch(console.error);
    },

    createCachedAsset(_, newAsset) {
      const tableName = 'asset';
      const key = 'id';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => makeTable(db, tableName, newAsset, key)) // eslint-disable-line no-use-before-define, max-len
        .then(tx => saveRecord(tx, tableName, newAsset)); // eslint-disable-line no-use-before-define, max-len
    },

    updateCachedAsset(context, asset) {
      const table = 'asset';
      const key = 'id';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, table, key)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, table, asset)); // eslint-disable-line no-use-before-define, max-len
    },

    loadCachedAssets({ commit }) {
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getRecords(db, 'asset')) // eslint-disable-line no-use-before-define
        .then((results) => {
          console.log('Cached Assets: ', results);
          commit('addAssets', results);
        })
        .catch(console.error);
    },

    createCachedArea(_, newArea) {
      const tableName = 'area';
      const key = 'tid';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => makeTable(db, tableName, newArea, key)) // eslint-disable-line no-use-before-define, max-len
        .then(tx => saveRecord(tx, tableName, newArea)); // eslint-disable-line no-use-before-define, max-len
    },

    updateCachedArea(context, area) {
      const table = 'area';
      const key = 'tid';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, table, key)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, table, area)); // eslint-disable-line no-use-before-define, max-len
    },

    loadCachedAreas({ commit }) {
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getRecords(db, 'area')) // eslint-disable-line no-use-before-define
        .then((results) => {
          console.log('Cached Areas: ', results);
          commit('addAreas', results);
        })
        .catch(console.error);
    },

  },
};

/*
  Helper funcitons called by actions.  Many of these helper functions
  execute SQL queries or AJAX requests.
*/

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
function getTX(db, table, key) {
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
    let sql;
    if (key === undefined) {
      sql = `CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, blankColumn TEXT)`;
    } else {
      sql = `CREATE TABLE IF NOT EXISTS ${table} (${key} INTEGER PRIMARY KEY, blankColumn TEXT)`;
    }
    db.transaction((tx) => {
      tx.executeSql(sql, null, handleResponse, handleError);
    });
  });
}


function makeTable(db, table, record, primaryKey) {
  return new Promise((resolve, reject) => {
    console.log(`making table with name ${table} and the following data template: ${JSON.stringify(record)}`);
    // Creates a table called 'tableName' in the DB if none yet exists
    db.transaction((tx) => {
      let fieldString = '';
      const keys = Object.keys(record);
      keys.forEach((i) => {
        // Iterate over all but the primaryKey, which will be added separately
        if (i !== primaryKey) {
          let suffix = '';
          if (typeof record[i] === 'number') {
            suffix = ' INT, ';
          } else if (typeof record[i] === 'boolean') {
            suffix = ' BOOLEAN, ';
          } else {
            suffix = ' VARCHAR(150), ';
          }
          fieldString = fieldString + i + suffix;
        }
      });
      // I need to trim the last two characters to avoid a trailing comma
      fieldString = fieldString.substring(0, fieldString.length - 2);

      let sql;
      // if no key is given, the id field will autoincrement beginning with 1
      if (primaryKey === undefined) {
        sql = `CREATE TABLE IF NOT EXISTS ${
          table
        } ( local_id INTEGER PRIMARY KEY AUTOINCREMENT, ${
          fieldString
        })`;
        // Otherwise use the primary key that's supplied
      } else {
        sql = `CREATE TABLE IF NOT EXISTS ${table} (
          ${primaryKey} INTEGER PRIMARY KEY,
           ${fieldString}
         )`;
      }

      tx.executeSql(sql, null, (_tx, result) => {
        console.log('Make table success. Result: ', result);
        resolve(_tx);
      }, (_tx, error) => {
        console.log(`Make table error: ${error.message}`);
        // Reject will return the tx object in case you want to try again.
        reject(_tx);
      });
    });
  });
}

/*
saveRecord either saves a new record or updates an existing one.
If log contains a property called local_id, the database updates the record with that local_id
If log contains no local_id property, a new record is created!
Params:
tx - the database context
table - string name of the table, AKA logType
log - object following the template for that logType
*/

function saveRecord(tx, table, log) {
  return new Promise((resolve, reject) => {
    console.log('SAVING THE FOLLOWING RECORDS:');
    console.log(log);

    let fieldString = '';
    let queryString = '';
    const keys = Object.keys(log);
    const values = Object.values(log);
    keys.forEach((i) => {
      fieldString = `${fieldString + i}, `;
      queryString = `${queryString}?, `;
    });

    // I need to trim the last two characters of each string to avoid trailing commas
    fieldString = fieldString.substring(0, fieldString.length - 2);
    queryString = queryString.substring(0, queryString.length - 2);


    console.log('add record strings');
    console.log(fieldString);
    console.log(queryString);
    console.log(values);

    // Set SQL based on whether the log contains a local_id fieldString
    const sql = `INSERT OR REPLACE INTO ${
      table
    } (${fieldString}) `
    + `VALUES (${queryString})`;

    tx.executeSql(sql, values, (_tx, results) => {
      console.log('INSERT success');
      resolve(results);
    }, (_tx, error) => {
      console.log(`INSERT error: ${error.message}`);
      reject(error.message);
    });
  });
}

function getRecords(db, table) {
  return new Promise(((resolve) => {
    // This is called if the db.transaction obtains data
    function dataHandler(tx, results) {
      const resultSet = [];
      for (let i = 0; i < results.rows.length; i += 1) {
        const row = results.rows.item(i);
        console.log(`RAW GETRECORDS RESULT ${i}: ${JSON.stringify(row)}`);
        resultSet.push(row);
      }
      resolve(resultSet);
      /*
      I'm not sure why, but the following line does not work in Cordova, though
      it does seem to work in the web app.  The resultSet code above replaces it.
      */
      // resolve([...results.rows]);
    }
    // This is called if the db.transaction fails to obtain data
    function errorHandler() {
      console.log('No old logs found in cache.');
      resolve([]);
    }

    db.transaction((tx) => {
      const sql = `SELECT * FROM ${table}`;

      tx.executeSql(sql, [],
        dataHandler,
        errorHandler);
    });
  }));
}

function deleteRecord(tx, table, id) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM ${table} WHERE local_id = ${id}`;
    tx.executeSql(sql, [], (_tx, res) => resolve(res), reject);
  });
}
