<template>
  <div>
    <h1>Edit Log</h1>
    <div class="well" >
      <!--
        TODO: make these input fields into child components and load them with
        v-for; pass down arguments for updateCurrentLog() as props, from the
        computed values of the current log
      -->
      <div class="form-item form-item-name form-group">
        <label for="name" class="control-label">Name</label>
        <input
          :value="logs[currentLogIndex].name"
          @input="updateCurrentLog('name', $event.target.value)"
          placeholder="Enter name"
          type="text"
          class="form-control"
          autofocus>
          <!-- TODO: is the autofocus attr good accessibility? -->
      </div>
      <div class="form-item form-item-name form-group">
        <label for="Date" class="control-label">Date</label>
        <input
          :value="convertOutOfUnix(logs[currentLogIndex].timestamp)"
          @input="updateCurrentLog('timestamp', convertIntoUnix($event.target.value))"
          type="date"
          class="form-control">
      </div>

      <div class="form-item form-item-name form-group">
        <label for="type" class="control-label ">Log Type</label>
          <select
            :value="logs[currentLogIndex].type"
            @input="updateCurrentLog('type', $event.target.value)"
            class="custom-select col-sm-3 ">
            <option value='farm_observation'>Observation</option>
            <option value='farm_activity'>Activity</option>
            <option value='farm_input'>Input</option>
            <option value='farm_harvest'>Harvest</option>
          </select>
      </div>

      <div class="form-item form-item-name form-group">
        <label for="notes" class="control-label ">Notes</label>
        <input
          :value="logs[currentLogIndex].notes"
          @input="updateCurrentLog('notes', $event.target.value)"
          placeholder="Enter notes"
          type="text"
          class="form-control">
      </div>

      <Autocomplete
        :objects="filteredAssets"
        searchKey="name"
        searchId="id"
        label="Add assets to the log"
        v-on:results="updateCurrentLog('field_farm_asset', $event)">
        <template slot="empty">
          <div class="empty-slot">
            <em>No assets found.</em>
            <br>
            <button
              type="button"
              class="btn btn-light"
              @click="forceSync"
              name="button">
              Sync Now
            </button>
          </div>
        </template>
      </Autocomplete>
      <Autocomplete
        :objects="filteredAreas"
        searchKey="name"
        searchId="tid"
        label="Add areas to the log"
        v-on:results="updateCurrentLog('field_farm_area', $event)">
        <template slot="empty">
          <div class="empty-slot">
            <em>No areas found.</em>
            <br>
            <button
              type="button"
              class="btn btn-light"
              @click="forceSync"
              name="button">
              Sync Now
            </button>
          </div>
        </template>
      </Autocomplete>


      <!-- not able to send quantities right now -->
      <!-- <div class="form-item form-item-name form-group">
        <label for="quantity" class="control-label ">Quantity</label>
        <div class="row reset-margin">
          <select
            @input="updateQuantityField('measure', $event.target.value)"
            class="custom-select col-sm-3 ">
            <option value='' selected>Select a measurement</option>
            <option value='temperature'>Temperature</option>
          </select>
          <input
            :value="logs[currentLogIndex].quantity"
            @input="updateCurrentLog('quantity', $event.target.value)"
            placeholder="Enter quantity"
            type="number"
            min="0"
            class="form-control col-sm-3">
          <select
            @input="updateQuantityField('unit', $event.target.value)"
            class="custom-select col-sm-3 form-control">
            <option value='' selected>Select a unit of measure</option>
            <option value='F'>F</option>
          </select>
        </div>
      </div> -->

      <br>
      <div class="input-group ">
        <button
          :disabled='false'
          title="Take picture with camera"
          @click="getPhoto"
          class="btn btn-info btn-navbar navbar-right"
          type="button">
          Take picture with camera
        </button>
        <button
          :disabled='false'
          title="Done Editing"
          @click="$emit('view-all')"
          type="button"
          class="btn btn-success btn-navbar">
          Done Editing
        </button>
      </div>
      <div class="input-group">
        <label
          class="custom-file-label"
          for="customFile">
          Select photo from file
        </label>
        <input
          type="file"
          class="custom-file-input"
          ref="photo"
          @change="loadPhoto($event.target.files)">
      </div>
      <div class="col">
        <img
          v-for="url in imageUrls"
          :src="url"
          :key="`preview-${imageUrls.indexOf(url)}`"
          class="preview" />
      </div>
      <br>
      <div class="well">
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import Autocomplete from './Autocomplete';

export default {
  components: {
    Autocomplete,
  },
  
  data() {
    return {
      imageUrls: [],
    };
  },

  props: [
    'logs',
    'areas',
    'assets',
    'currentLogIndex',
    'isWorking',
    'statusText',
    'photoLoc',
    'geolocation',
  ],

  created() {
    // Inititialize the log, default to "Observation"
    this.$store.dispatch('initializeLog', 'farm_observation');

    console.log(`GEOLOCATION IN APP STORE IS LAT: ${this.geolocation.Latitude}, LONG: ${this.geolocation.Longitude}`);
  },

  methods: {

    convertOutOfUnix(unixTimestamp) {
      return moment.unix(unixTimestamp).format('YYYY-MM-DD');
    },

    convertIntoUnix(nonUnixTimestamp) {
      return Math.floor(new Date(nonUnixTimestamp).getTime() / 1000).toString();
    },

    forceSync() {
      this.$store.dispatch('forceSyncAssetsAndAreas');
    },

    updateCurrentLog(key, val) {
      const newProps = {
        [key]: val,
        isCachedLocally: false,
      };
      this.$store.commit('updateCurrentLog', newProps);
      console.log('WROTE THE FOLLOWING TO CURRENT LOG WITH updateCurrentLog');
      console.log(newProps);
    },

    updateQuantityField(key, val) { // eslint-disable-line no-unused-vars
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

    loadPhoto(files) {
      for (let i = 0; i < files.length; i += 1) {
        this.imageUrls.push(window.URL.createObjectURL(files[i]));
        this.$store.dispatch('loadPhotoBlob', files[i]);
      }
    },

  },

  computed: {
    /*
      In order to avoid duplicates, filteredAssets & filteredAreas remove
      assets/areas from the array of searchable objects if they've already been
      added to the current log.
    */
    filteredAssets() {
      const selectedAssets = this.logs[this.currentLogIndex].field_farm_asset
      return this.assets.filter(asset => {
        return !selectedAssets.some(selAsset => asset.id === selAsset.id);
      })
    },
    filteredAreas() {
      const selectedAreas = this.logs[this.currentLogIndex].field_farm_area
      return this.areas.filter(area => {
        return !selectedAreas.some(selArea => area.tid === selArea.tid);
      })
    },

  },

  watch: {
    // When photoLoc changes, this updates the images property of the current log
    photoLoc() {
      console.log(`UPDATING CURRENT RECORD PHOTO LOC: ${this.photoLoc}`);
      this.updateCurrentLog('images', this.photoLoc);
    },
  },
};

</script>

<style scoped>
  .reset-margin {
    margin: 0 0;
  }
  .preview {
    width: 100%;
    height: 100%;
  }

  .empty-slot {
    text-align: center;
    color: var(--gray);
  }

  .empty-slot button {
    margin: 0.5rem;
    color: var(--gray);
  }

</style>
