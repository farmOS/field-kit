<template>
  <div>
    <h4>{{vueHeader}}</h4>
    <div class="well" >
      <!--
        TODO: make these input fields into child components and load them with
        v-for; pass down arguments for updateCurrentLog() as props, from the
        computed values of the current log
      -->
      <div class="form-item form-item-name form-group">
        <label for="name" class="control-label row">Name</label>
        <input
          :value="logs[currentLogIndex].name"
          @input="updateCurrentLog('name', $event.target.value)"
          placeholder="Enter name"
          type="text"
          class="form-control row"
          autofocus>
          <!-- TODO: is the autofocus attr good accessibility? -->
      </div>
      <div class="form-item form-item-name form-group">
        <label for="Date" class="control-label row">Date</label>
        <input
          :value="convertOutOfUnix(logs[currentLogIndex].timestamp)"
          @input="updateCurrentLog('timestamp', convertIntoUnix($event.target.value))"
          type="date"
          class="form-control row">
      </div>

      <div class="form-item form-item-name form-group">
        <label for="notes" class="control-label row">Notes</label>
        <input
          :value="logs[currentLogIndex].notes"
          @input="updateCurrentLog('notes', $event.target.value)"
          placeholder="Enter notes"
          type="text"
          class="form-control row">
      </div>
      <!-- not able to send quantities right now -->
      <div class="form-item form-item-name form-group">
        <label for="quantity" class="control-label row">Quantity</label>
        <div class="row">
          <select
            @input="updateQuantityField('measure', $event.target.value)"
            class="custom-select col-3 ">
            <option value='' selected>Select a measurement</option>
            <option value='temperature'>Temperature</option>
          </select>
          <input
            :value="logs[currentLogIndex].quantity"
            @input="updateCurrentLog('quantity', $event.target.value)"
            placeholder="Enter quantity"
            type="number"
            min="0"
            class="form-control col-3">
          <select
            @input="updateQuantityField('unit', $event.target.value)"
            class="custom-select col-3 form-control">
            <option value='' selected>Select a unit of measure</option>
            <option value='F'>F</option>
          </select>
        </div>
      </div>

    <br>
    <div class="input-group row">
      <button
        :disabled='false'
        title="Get picture"
        @click="getPhoto"
        class="btn btn-default"
        type="button">
        Get picture
      </button>
      <button
        :disabled='false'
        title="Done Editing"
        @click="$emit('view-all')"
        type="button">
        Done Editing
      </button>
    </div>
      <br>
      <div class="well">
        <p>{{statusText}}</p>
        <!-- <spinner :size="30" v-if="isWorking"></spinner> -->
        <!--
        <br>
        <p v-if="isWorking">SPINNER SPIN!</p>
      -->
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
// removed spinner b/c it caused compilation errors
// import Spinner from 'vue-spinner-component/src/Spinner.vue';
export default {
  components: {
    // Spinner
  },
  data() {
    return {
      vueHeader: 'Enter your new observation:',
    };
  },
  props: [
    'logs',
    'currentLogIndex',
    'isWorking',
    'statusText',
    'photoLoc',
    'isOnline',
  ],
  created() {
    this.$store.commit('setStatusText', `NETWORK STATUS: ${this.isOnline}`);
    // TODO: It probably makes more sense to remember the last log the user was working on,
    //    and only initialize a new log when they deliberately choose to.
    this.$store.dispatch('initializeLog', 'farm_observation');
  },
  methods: {

    convertOutOfUnix(unixTimestamp) {
      return moment.unix(unixTimestamp).format('YYYY-MM-DD');
    },

    convertIntoUnix(nonUnixTimestamp) {
      return Math.floor(new Date(nonUnixTimestamp).getTime() / 1000).toString();
    },

    updateCurrentLog(key, val) {
      const newProps = {
        [key]: val,
        isCachedLocally: false,
      };
      this.$store.commit('updateCurrentLog', newProps);
    },

    updateQuantityField(key, val) {
      // TODO: figure out how this gets stored in SQL before uncommenting
      // this.updateCurrentLog('quantity', {
      //   ...this.logs[this.currentLogIndex].quantity,
      //   [key]: val,
      // })
    },

    getPhoto() {
      // Obtains an image location from the camera!
      return this.$store.dispatch('getPhotoLoc');
    },

  },

  watch: {
    // When photoLoc changes, this updates the photo_loc property of the current log
    photoLoc() {
      console.log(`UPDATING CURRENT RECORD PHOTO LOC: ${this.photoLoc}`);
      this.updateCurrentLog('photo_loc', this.photoLoc);
    },
  },
};

</script>

<style scoped>
  /* select {
    display: inline-block;
  } */

</style>
