<template>
  <div>
    <h4>{{vueHeader}}</h4>
    <!-- Display input form if chooser is inactive -->
    <!-- Don't use this.object notation in templates -->
    <div class="well" v-if="!isChoosing">
    <div class="input-group">
      <input v-model="observation.text" placeholder="Enter your observation" type="text" class="form-control">
    </div>
    <br>
    <li v-for="i in obsLinks">
      <button @click="makeChoice(i)" class="btn btn-default" type="button" >{{ i }}</button> &nbsp; <label>{{observation[i]}}</label>
    </li>
    <br>
    <div class="input-group">
      <button :disabled="observation.text === ''" @click="recordObservation" class="btn btn-default" type="button" >Record observation!</button>
    </div>
    </div>
    <!-- Display chooser -->
    <chooser v-if="isChoosing" :toChoose="toChoose" @didChoose="registerChoice" ></chooser>


  </div>
</template>

<script>
import Chooser from './Chooser'
import DataNative from './DataNative'
export default {
  components: {
    // DataNative,
    Chooser
  },
  // props: ['dataStore'],
  data () {
  return {
    dataStore: DataNative.data().assets,
    vueHeader: 'Enter your new observation:',
    isChoosing: false,
    choiceObject: '',
    /*
    observation: {
      text: '',
      plantings: '',
      locations: '',
      livestock: ''
    },
    */
    toChoose: []
    }
  }, // data
  computed: {
    //Get a list of properties in the dataStore
    obsLinks () {
      var properties = []
      for (var i in this.dataStore){
        if (i !== 'text'){
          properties.push(i);
        }
      }
      console.log('Observation links = '+properties)
      return properties;
    },
    //Create an observation object w/ all the properties in the datastore + text
    observation () {
      var newObs = {text: ''};
      for (var i in this.dataStore){
        newObs[i] = '';
      }
      console.log('newObservation module observations:')
      for (var i in newObs) {
        console.log(i);
      }

      return newObs;
    }
  }, // computed
  methods: {
    recordObservation () {
      console.log('Observation recorded');
      this.$emit('didSubmitObservation', this.observation);
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
  } // methods
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
