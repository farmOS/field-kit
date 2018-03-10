<template>
  <div>
    <h4>{{vueHeader}}</h4>
    <!-- Display input form if chooser is inactive -->
    <div class="well" >
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
          @input="updateCurrentLog('timestamp', convertIntoUnix($event.target.value))"
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
      <li v-for="i in logs">
        {{i}}
      </li>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';
export default {
  data () {
  return {
    vueHeader: 'Enter your new observation:',
    }
  },
  computed: mapState({
    logs: state => state.data.logs,
    currentLogIndex: state => state.data.currentLogIndex,
  }),

  created: function () {
    this.$store.dispatch('loadCachedLogs', 'farm_observation');
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
        type: currentLog.type,
      };
      this.$store.dispatch('recordObservation', obs);
    },

    convertOutOfUnix (unixTimestamp) {
      return moment.unix(unixTimestamp).format('YYYY-MM-DD')
    },

    convertIntoUnix (nonUnixTimestamp) {
      return Math.floor(new Date(nonUnixTimestamp).getTime() / 1000).toString()
    },

    updateCurrentLog (key, val) {
      const newProperty = {key, val};
      this.$store.commit('updateCurrentLog', newProperty)
    },

  },
}

</script>

<style scoped>

</style>
