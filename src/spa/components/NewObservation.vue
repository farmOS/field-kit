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
          :value="logs[currentLogIndex].notes"
          @input="updateCurrentLog('notes', $event.target.value)"
          placeholder="Enter notes"
          type="text"
          class="form-control"
        >
      </div>
      <!--
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
    -->
      <br>
      <div class="input-group">
        <button :disabled='false' title="Send current log to farmOS server" @click="pushToServer" class="btn btn-default" type="button" >Send current log to farmOS server</button>
      </div>
      <br>
      <div class="well">
        <p>{{statusText}}</p>
        <spinner :size="30" v-if="isWorking"></spinner>
        <!--
        <br>
        <p v-if="isWorking">SPINNER SPIN!</p>
      -->
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
//adding spinner plugin
import Spinner from 'vue-spinner-component/src/Spinner.vue';
export default {
  components: {
    Spinner
  },
  data () {
  return {
    vueHeader: 'Enter your new observation:',
    }
  },
  computed: mapState({
    logs: state => state.farm.logs,
    currentLogIndex: state => state.farm.currentLogIndex,
    isWorking: state => state.farm.isWorking,
    statusText: state => state.farm.statusText,
  }),
  created: function () {
    // TODO: It probably makes more sense to remember the last log the user was working on,
    //    and only initialize a new log when they deliberately choose to.
    this.$store.dispatch('initializeLog', 'farm_observation')
  },
  beforeDestroy: function () {
    this.$store.commit('clearLogs')
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
      this.$store.commit('updateCurrentLog', newProps)
    },

    pushToServer () {
      var storage = window.localStorage;
      var storedUrl = storage.getItem('url');
      var storedToken = storage.getItem('token');

      const pushProps = {url: storedUrl, token: storedToken}
      this.$store.dispatch('pushToServer', pushProps)
    }

  },
}

</script>

<style scoped>

</style>
