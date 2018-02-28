<template>
  <div>
    <h4>{{vueHeader}}</h4>
    <!-- Display input form if chooser is inactive -->
    <div class="well" v-if="!isChoosing">
      <div class="input-group">
        <input v-model="observation.name" placeholder="Enter name" type="text" class="form-control">
      </div>
      <div class="input-group">
        <input v-model="observation.date" placeholder="Enter date" type="text" class="form-control">
      </div>
      <div class="input-group">
        <input v-model="observation.notes" placeholder="Enter notes" type="text" class="form-control">
      </div>
      <div class="input-group">
        <input v-model="observation.quantity" placeholder="Enter quantity" type="text" class="form-control">
      </div>
      <br>
      <div class="input-group">
        <button @click="recordObservation" class="btn btn-default" type="button" >Record observation!</button>
      </div>
      <div class="input-group">
        <button @click="getLogs" class="btn btn-default" type="button" >Get logs!</button>
      </div>
      <!--When Get logs is pressed, display a list of text items logs array-->
      <li v-for="i in logs">
        {{i}}
      </li>
    </div>
    <chooser v-if="isChoosing" :toChoose="toChoose" @didChoose="registerChoice" ></chooser>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Chooser from './Chooser';
import DataNative from './DataNative';
import DataModule from './DataModule';
export default {
  components: {
    Chooser,
    DataModule
  },
  data () {
  return {
    dataStore: DataNative.data().defaultObservations,
    vueHeader: 'Enter your new observation:',
    isChoosing: false,
    choiceObject: '',
    toChoose: [],
    obsFields: [],
    //Temporarily creating static observation record:
    observation: {name: '', date: '', notes: '', quantity: ''}
    }
  },
  computed: mapState({
        dataTestState: state => state.data.test,
        logs: state => state.data.logs,
        logCount: state => state.data.logCount
      }),

  created: function () {
    this.$store.dispatch('loadCachedLogs');
  },
  methods: {
    recordObservation () {
      this.$store.dispatch('recordObservation', this.observation);
    },

    getLogs () {
      this.$store.dispatch('getLogs', this.observation);
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
      }
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
    }
  },
}

</script>

<style scoped>

</style>
