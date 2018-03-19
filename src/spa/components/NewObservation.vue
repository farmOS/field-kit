<template>
  <div>
    <h4>{{vueHeader}}</h4>
    <!-- Display input form if chooser is inactive -->
    <div class="well" >
      <!-- TODO: make these input fields into child components and load them with v-for -->
      <!-- TODO: pass down arguments for updateCurrentLog() as props, from the computed values of the current log -->
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
          :value="logs[currentLogIndex].field_farm_notes"
          @input="updateCurrentLog('field_farm_notes', $event.target.value)"
          placeholder="Enter notes"
          type="text"
          class="form-control"
        >
      </div>
      <div class="input-group">
        <input
          :value="logs[currentLogIndex].field_farm_quantity"
          @input="updateCurrentLog('field_farm_quantity', $event.target.value)"
          placeholder="Enter quantity"
          type="number"
          min="0"
          class="form-control"
        >
      </div>
      <br>
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
    this.$store.dispatch('initializeLogs', 'farm_observation')
  },
  methods: {

    convertOutOfUnix (unixTimestamp) {
      return moment.unix(unixTimestamp).format('YYYY-MM-DD')
    },

    convertIntoUnix (nonUnixTimestamp) {
      return Math.floor(new Date(nonUnixTimestamp).getTime() / 1000).toString()
    },

    updateCurrentLog (key, val) {
      const newProps = {
        [key]: val,
        isCachedLocally: false
      };
      this.$store.dispatch('updateCurrentLog', newProps)
    },

  },
}

</script>

<style scoped>

</style>
