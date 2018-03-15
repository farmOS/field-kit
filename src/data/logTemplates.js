// This is the output of a call to http://farmos-base-url/log/1, converted from JSON to a plain object literal.
const logTemplates = {
  rawTemplates: {
    observations: {
      field_farm_files: [],
      field_farm_images: [],
      field_farm_area: [],
      field_farm_asset: [],
      field_farm_geofield: [],
      field_farm_inventory: [],
      field_farm_log_category: [],
      field_farm_log_owner: [
        {
          uri: 'http://localhost/user/1',
          id: '1',
          resource: 'user'
        }
      ],
      field_farm_notes: {
        value: '<p>some notes</p>\n',
        format: 'farm_format'
      },
      field_farm_quantity: [],
      id: '1',
      name: 'some log name',
      type: 'farm_observation',
      uid: {
        uri: 'http://localhost/user/1',
        id: '1',
        resource: 'user'
      },
      timestamp: '1519423702',
      created: '1519423702',
      changed: '1519423744',
      done: '1',
      url: 'http://localhost/log/1',
      feeds_item_guid: null,
      feeds_item_url: null,
      feed_nid: null
    } //end observations
  }, //end rawTemplates
/*For each table, we have a template with keys corresponding to properties stored as something other than a simple string
  each property key is associated with an object containing a prefix and suffix
  these are appended to values with the same property key using the parseProp function
*/
  propTemplates: {
    observations: {
      field_farm_notes: {
        prefix: '{\"value\":\"<p>',
        suffix: '</p>\\n\",\"format\":\"farm_format\"}'
      }
    } //end observations
  } //end propTemplates
}

/*
makeLog is called by the UI with a payload of input provided by the user
it packages the values into farmOS format and saves them to the database.
the payload is an object with log and logType properties
log is an object containing of string values.  logType is a simple string.
*/

function makeLog (payload) {

  //Unpacking the payload into log and table
  const log = payload.log;
  console.log('MAKELOG CALLED WITH LOG:');
  console.log(log);
  const table = payload.logType;

  var rawTemplates = logTemplates.rawTemplates;
  //Open the template for the log type.  For each template property matching a property in log, write log values into template
  for (var rawProp in rawTemplates) {
    if( rawTemplates.hasOwnProperty(rawProp) && table === rawProp) {
      //var logFull = rawTemplates[rawProp]
      var logFull = {};
      for (var rawSubProp in rawTemplates[rawProp]) {
        var subPropTemplate = rawTemplates[rawProp][rawSubProp];

        //First, place a string version of the template data into the new record
        if (isObject(JSON.stringify(subPropTemplate)) || isArray(JSON.stringify(subPropTemplate))){
          logFull[rawSubProp] = JSON.stringify(subPropTemplate);
        } else {
          logFull[rawSubProp] = subPropTemplate;
        }

        //If the user has entered a value for a prop, overwrite it!
        for (var logItem in log){
          if (logItem === rawSubProp) {
              //Write a new value to template
              //Use parseProp, isObject and isArray to append prefix and suffix where needed to achieve farmOS format
              var oneProp;
              if (isObject(JSON.stringify(log[logItem])) || isArray(JSON.stringify(log[logItem]))){
                oneProp = JSON.stringify(log[logItem]);
              } else {
                oneProp = log[logItem];
              }
              logFull[rawSubProp] = parseProp(table, logItem, oneProp);
          }
        } // end for log
      }// end for rawSubProp

      //Before adding to database, we must add the synced property
      logFull.synced = false;

      /* TEST
      ADD A local_id PROP TO OVER-WRITE AN EXISTING RECORD
      */
      logFull.local_id = 3;


      console.log('MODIFIED LOG TO SAVE:');
      console.log(logFull);


      openDatabase()
      .then(function(db) {
        return getTX(db, table);
      })
      .then(function(tx) {
        saveRecord(tx, table, logFull);
      })
      .then(function() {
        dispatch('getAll', table);
      })

    }//if hasOwn
  }//for rawProp

}, //end makeLog


/*
loadCachedLogs creates tables based on all log templates stored in logTemplates.js
It also loads the values from each template into the newly created tables
logTemplates.rawTemplates contains properly formatted logs of each possible type
These correspond to the expected raw server output for each log type
*/

function loadCachedLogs() {

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

          var parsedValue;
          if (isObject(JSON.stringify(rawTemplates[rawProp][rawSubProp])) || isArray(JSON.stringify(rawTemplates[rawProp][rawSubProp]))){
            parsedValue = JSON.stringify(rawTemplates[rawProp][rawSubProp]);
          } else {
            parsedValue = rawTemplates[rawProp][rawSubProp];
          }
          payLoadBuilder[rawSubProp] = parsedValue;

        }// end sub raw

        return payLoadBuilder;
      } //end payload

      //Before sending to the database, we must add the synced property
      var modPayload = payload();
      modPayload.synced = false;
      console.log('MODIFIED PAYLOAD:')
      console.log(modPayload)

      /* TODO
      createdDB does not belong in the store!  It needs to be persistent state, which it currently isn't.
      */
      //Turn this OFF when resetting the database, then back ON after reset in order to avoid duplication of the template record
      // commit('toggleCreatedDB');

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
          console.log('addUnsyncedLogsToState', {logType:tableName, log:[payload()]});
          // set didCreateDB to true
          // commit('toggleCreatedDB');
        })
      }// end if !didCreateDB

    }//end if has raw
  }//end for var raw
}, //end loadCachedLogs


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
