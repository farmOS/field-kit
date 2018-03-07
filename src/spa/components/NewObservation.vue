<template>
  <div>
    <h4>{{vueHeader}}</h4>
    <!-- Display input form if chooser is inactive -->
    <div class="well" v-if="!isChoosing">
      <div class="input-group">
        <!-- TODO: Replace this with a dropdown to select names from list of valid users -->
        <input
          :value="logs[currentLogIndex].name"
          @input="updateCurrentLog('name', $event.target.value)"
          placeholder="Enter name"
          type="text"
          class="form-control"
        >
      </div>
      <div class="input-group">
        <input
          :value="convertOutOfUnix(logs[currentLogIndex].timestamp)"
          @input="updateCurrentLog('timestamp', $event.target.value)"
          type="date"
          class="form-control"
        >
      </div>
      <div class="input-group">
        <input
          :value="logs[currentLogIndex].notes"
          @input="updateCurrentLog('notes', $event.target.value)"
          placeholder="Enter notes"
          type="text"
          class="form-control"
        >
      </div>
      <div class="input-group">
        <input
          :value="logs[currentLogIndex].quantity"
          @input="updateCurrentLog('quantity', $event.target.value)"
          placeholder="Enter quantity"
          type="number"
          min="0"
          class="form-control"
        >
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
import moment from 'moment';
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
        logs: state => state.data.logs,
        currentLogIndex: state => state.data.currentLogIndex,
      }),

  created: function () {
    this.$store.dispatch('loadCachedLogs');
    this.$store.dispatch('initializeLog', 'farm_observation')
  },
  methods: {
    recordObservation () {
      const currentLog = this.logs[this.currentLogIndex];
      const obs = {
        name: currentLog.name,
        timestamp: currentLog.timestamp,
        notes: currentLog.notes,
        quantity: currentLog.quantity,
      };
      this.$store.dispatch('recordObservation', obs);
    },

    convertOutOfUnix (unixTimestamp) {
      return moment.unix(unixTimestamp).format('YYYY-MM-DD')
    },

    updateCurrentLog (key, val) {
      let newProperty = {};
      if (key === 'timestamp') {
        const dateVal = Math.floor(new Date(val).getTime() / 1000).toString()
        newProperty[key] = dateVal;
      } else {
        newProperty[key] = val;
      };
      this.$store.commit('updateCurrentLog', newProperty)
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
