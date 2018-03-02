<template>
  <div>
    <h4>{{vueHeader}}</h4>
    <!-- Display input form if chooser is inactive -->
    <!-- Don't use this.object notation in templates -->
    <div class="well" v-if="!isChoosing">


    <div class="input-group">
      <input v-model="observation.name" placeholder="Enter name" type="text" class="form-control">
    </div>
    <div class="input-group">
      <input v-model="observation.timestamp" placeholder="Enter date" type="text" class="form-control">
    </div>
    <div class="input-group">
      <input v-model="observation.notes" placeholder="Enter notes" type="text" class="form-control">
    </div>



    <!--Not yet functional
    <br>
    <li v-for="(item, key, index) in observation">
      <input :v-model="observation.key" :placeholder="key" type="text" class="form-control">
    </li>
    -->

    <!-- Not currently linking to assets; enable when we get back to that
    <br>
    <li v-for="i in obsLinks">
      <button @click="makeChoice(i)" class="btn btn-default" type="button" >{{ i }}</button> &nbsp; <label>{{observation[i]}}</label>
    </li>
    -->
    <br>
    <div class="input-group">
      <button @click="recordObservation" class="btn btn-default" type="button" >Record observation!</button>
      <!--<button :disabled="observation.name === ''" @click="recordObservation" class="btn btn-default" type="button" >Record observation!</button>-->
    </div>
    <!--Get logs-->
    <div class="input-group">
      <button @click="getObservations" class="btn btn-default" type="button" >Get logs!</button>
      <!--<button :disabled="observation.name === ''" @click="recordObservation" class="btn btn-default" type="button" >Record observation!</button>-->
    </div>

    <!--When Get logs is pressed, display a list of text items logs array-->
    <li v-for="i in logs">
    {{i}}
    </li>


    <!-- No longer displaying DataModule.vue template -->
    <!--<data-module :newRecordCount="newRecordCount" :newRecord="newRecord"></data-module>-->

    </div>
    <!-- Display chooser -->
    <chooser v-if="isChoosing" :toChoose="toChoose" @didChoose="registerChoice" ></chooser>



  </div>
</template>

<script>
import { mapState } from 'vuex';

import Chooser from './Chooser'
import DataNative from './DataNative'
import DataModule from './DataModule'
export default {
  components: {
    // DataNative,
    Chooser,
    DataModule
  },
  // props: ['dataStore'],
  data () {
  return {
    dataStore: DataNative.data().defaultObservations,
    vueHeader: 'Enter your new observation:',
    isChoosing: false,
    choiceObject: '',
    toChoose: [],
    obsFields: [],

    //Temporarily creating static observation record:
    observation: {name: '', timestamp: '', notes: '', synced: 'false'}

    //Pass on to the data module.  I watch newRecordCount, and get data from newRecord when it increments
    //newRecord: [],
    //newRecordCount: 0
    }
  }, // data
  computed: mapState({
        dataTestState: state => state.data.test,
        logs: state => state.data.logs,
        logCount: state => state.data.logCount
      }),

    //Enable to allow this component to read state from the data module
/*
{
    //Create an observation object w/ all the properties in the datastore + id
    observation () {
      var newObs = {};
      for (var i in this.dataStore[0]){
        newObs[i] = '';
        this.obsFields.push(i);
      }
      console.log('newObservation module observations:')
      for (var i in newObs) {
        console.log(i);
      }

      return newObs;
    },

    //We are not currently linking observations to assets.  When we do, we can use this to build a list from the assets object

    obsLinks () {
      var properties = []
      for (var i in this.dataStore){
        if (i !== 'text'){
          properties.push(i);
        }
      }
      console.log('Observation links = '+properties)
      return properties;
    }

  }, // computed
*/
  created: function () {
    this.$store.dispatch('loadCachedLogs');
  },
  methods: {
    /* Disable this temporarily; may move to dataModule store ###
    loadDefaultObservations () {
      console.log("LOADING DEFAULT OBSERVATIONS")
      for (var i in this.dataStore) {
        //Adds each default observation from the datastore into the SQL DB
          this.newRecord = i
          this.newRecordCount++
      }
    },
    */

    recordObservation () {
      console.log('Observation recorded');
      //Open database and create new table if needed

      //Problem: I can't seem to pass multiple params to the action.  Will need to compile into one object.
      // Passing form data to a new log of type observation
      //this.$store.dispatch('makeLog', this.observation, 'observations');

      //For now, I will pass only this.observation, and insert 'observations' in the makeLog action
      this.$store.dispatch('makeLog', this.observation);

      //this.DataModule.$emit('didSubmitObservation', this.observation);
    },

    getObservations () {
      console.log('Retrieving observations');
      //Now I'm getting a log, the data of which will populate to logs
      this.$store.dispatch('getAll', 'observations');
      //Set to display as text in the template with v-for
    },

    makeChoice (object) {
      var objNames = [];
      //set object received from function call (button) as choiceObject
      this.choiceObject = object;
      //iterate through property names of the data object and retrieve data accordingly
      for (var i in this.dataStore) {
      //for (var i in Object.keys(this.dataStore)) {
        console.log('Datastore property: '+i)
        if (object === i) {
          for (var j in this.dataStore[i]) {
            objNames.push(this.dataStore[i][j].name);
          }
        }
      } //end for this.dataStore

      console.log('Names from DataNative object:');
      console.log(objNames);
      //Only move to chooser if there are items to choose from!
      if (objNames.length > 0) {
      this.toChoose = objNames;
      this.isChoosing = true;
      }
      // cannot read prop 'locations' of undefined
      //toChoose = dataStore.locations;
      //isChoosing = true;
    },
    registerChoice (chosen) {
      console.log('Choice registered');
      this.isChoosing = false;
      //Clear list of objects to choose from
      this.toChoose = [];

      for (var i in this.dataStore) {
        if (this.choiceObject === i) {
          this.observation[i] = chosen;
          return;
        }
      }
      /*
      if (this.choiceObject === 'locations') {
        this.observation.locations = chosen;
        return;
      }
      if (this.choiceObject === 'plantings') {
        this.observation.plantings = chosen;
        return;
      }
      this.observation.livestock = chosen;
      return;
      */
    }
  }, // methods

  //Execute methods on page load
  /* Disable this temporarily; may move to DataModule ###
  created: function(){
    this.loadDefaultObservations()
  } // end created
*/
} // end export default

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
