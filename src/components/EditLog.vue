<template>
  <div>
    <h1>Edit Log</h1>
    <div class="well" >

      <div class="form-item form-item-name form-group">
        <label for="name" class="control-label">Name</label>
        <input
          :value="logs[currentLogIndex].name"
          @input="updateCurrentLog('name', $event.target.value)"
          placeholder="Enter name"
          type="text"
          class="form-control"
          autofocus>

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
        v-on:results="addAsset($event)">
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

      <div
        v-for="(asset, i) in logs[currentLogIndex].field_farm_asset"
        v-bind:key="`log-${i}-${Math.floor(Math.random() * 1000000)}`"
        class="form-item form-item-name form-group">
        <label for="type" class="control-label ">{{ asset.name }}</label>
        <button
          :disabled='false'
          title="Remove"
          @click="removeAsset(asset)"
          class="btn btn-danger">
          Remove
        </button>
      </div>

      <!-- We're using a radio button to choose whether areas are selected
      automatically based on device location, or using an Autocomplete.
      This will use the useLocalAreas conditional var -->
      <div class="form-check">
        <input
        v-model="useLocalAreas"
        type="radio"
        class="form-check-input"
        id="dontUseGeo"
        name="geoRadioGroup"
        v-bind:value="false"
        checked>
        <label class="form-check-label" for="dontUseGeo">Search areas</label>
      </div>
      <div class="form-check">
        <input
        v-model="useLocalAreas"
        type="radio"
        class="form-check-input"
        id="doUseGeo"
        name="geoRadioGroup"
        v-bind:value="true"
        >
        <label class="form-check-label" for="doUseGeo">Use my location</label>
      </div>

      <!-- If using the user's, show a select menu of nearby locations -->
      <div v-if="useLocalAreas" class="form-group">
        <label for="areaSelector">Farm areas near your current location</label>
        <select
          @input="addArea($event.target.value)"
          class="form-control"
          name="areas">
          <option v-if="localArea.length < 1" value="">No other areas nearby</option>
          <option v-if="localArea.length > 0" value="" selected>-- Select an Area --</option>
          <option
            v-if="localArea.length > 0"
            v-for="area in localArea"
            :value="area.tid">
            {{area.name}}
          </option>
        </select>
      </div>

      <!-- If not using the user's location, show a search bar -->
      <Autocomplete
        v-if="!useLocalAreas"
        :objects="filteredAreas"
        searchKey="name"
        searchId="tid"
        label="Add areas to the log"
        v-on:results="addArea($event)">
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

      <!-- Display the areas attached to each log -->
      <div
        v-for="(area, i) in logs[currentLogIndex].field_farm_area"
        v-bind:key="`log-${i}-${Math.floor(Math.random() * 1000000)}`"
        class="form-item form-item-name form-group">
        <label for="type" class="control-label ">{{ area.name }}</label>
        <button
          :disabled='false'
          title="Remove"
          @click="removeArea(area)"
          class="btn btn-danger">
          Remove
        </button>
      </div>


      <!-- We're using a button to attach the current location to the log
      as a field_farm_geofield -->

      <button
        :disabled='false'
        title="Add my GPS location to the log"
        @click="addLocation"
        type="button"
        class="btn btn-success btn-navbar">
        Add my GPS location to the log
      </button>
      <!-- Display a spinner while getting geolocation, then display the location -->
      <div v-if="attachGeo && isWorking">
        <icon-spinner/>
      </div>
      <p v-if="logs[currentLogIndex].field_farm_geofield.length > 0">
        Location set to {{ logs[currentLogIndex].field_farm_geofield[0].geom }}
      </p>

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
        <router-link :to="'/logs'">
          <button
            :disabled='false'
            title="Done Editing"
            type="button"
            class="btn btn-success btn-navbar">
            Done Editing
          </button>
        </router-link>
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
import iconSpinner from '../icons/icon-spinner.vue';

export default {
  components: {
    Autocomplete,
    iconSpinner,
  },

  data() {
    return {
      imageUrls: [],
      attachGeo: false,
      useLocalAreas: false,
      addedArea: false,
      isWorking: false,
    };
  },

  props: [
    'logs',
    'areas',
    'assets',
    'currentLogIndex',
    'statusText',
    'photoLoc',
    'geolocation',
    'localArea',
  ],

  created() {
    if (typeof this.$route.params.index === 'number') {
      // If a log index is provided in query params, set it as current log
      this.$store.commit('setCurrentLogIndex', this.$route.params.index)
    } else {
      // Otherwise inititialize a new log (check for a type param & default to "Observation")
      const logType = (this.$route.params.type) ? this.$route.params.type : 'farm_observation'
      this.$store.dispatch('initializeLog', logType);
    }
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

    addAsset(id) {
      const selectedAsset = this.assets.find(asset => asset.id === id);
      const newAssets = this.logs[this.currentLogIndex].field_farm_asset.concat(selectedAsset);
      this.updateCurrentLog('field_farm_asset', newAssets);
    },

    addArea(tid) {
      if (tid !== "") {
        const selectedArea = this.areas.find(area => area.tid === tid);
        const newAreas = this.logs[this.currentLogIndex].field_farm_area.concat(selectedArea);
        this.updateCurrentLog('field_farm_area', newAreas);
        this.checkAreas();
      }
      this.checkAreas();
    },

    removeAsset(asset) {
      const newAssets = this.logs[this.currentLogIndex].field_farm_asset
        .filter(_asset => _asset.id !== asset.id);
      this.updateCurrentLog('field_farm_asset', newAssets);
    },

    removeArea(area) {
      const newAreas = this.logs[this.currentLogIndex].field_farm_area
        .filter(_area => _area.tid !== area.tid);
      this.updateCurrentLog('field_farm_area', newAreas);
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

    addLocation() {
      //Get geolocation if necessary; otherwise add geolocation
      if (this.geolocation.Longitude == undefined) {
        this.$store.dispatch('getGeolocation');
        this.attachGeo = true;
        this.isWorking = true;
      }
      if (this.geolocation.Longitude !== undefined) {
        this.attachGeo = true;
        const location = JSON.parse("[{\"geom\":\"POINT ("+this.geolocation.Longitude+" "+this.geolocation.Latitude+")\"}]");
        console.log(`ATTACH GEOLOCATION: ${location}`)
        this.updateCurrentLog('field_farm_geofield', location);
      }
    },

    checkAreas() {
      console.log("CALLED CHECKAREAS; DOING CHECKINSIDE");
      // Use checkInside in geoModule with each area to see if the current location is inside an area
      let insideArea = false;
      this.filteredAreas.forEach((area) => {
        if(area.field_farm_geofield[0] !== undefined && this.geolocation.Longitude !== undefined) {
          // If the current location is inside an area, add the area to the log
          const lonlat = [this.geolocation.Longitude, this.geolocation.Latitude];
          // checkInNear requires a point, an area, and a radius around the point in kilometers
          const areaProps = {point: lonlat, area: area, radius: 0.02};
          // This is the problem!  Dispatch isn't working...
          this.$store.dispatch('checkInNear', areaProps);
        }
      });
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
    geolocation() {
      // When the geolocation is set, EITHER set field_farm_geofield OR select areas based on location
      if (this.attachGeo && this.geolocation.Longitude !== undefined) {
        const location = JSON.parse("[{\"geom\":\"POINT ("+this.geolocation.Longitude+" "+this.geolocation.Latitude+")\"}]");
        console.log(`ATTACH GEOLOCATION: ${location}`)
        this.updateCurrentLog('field_farm_geofield', location);
        this.isWorking = false;
        // If we are getting local areas
      }
      if(this.useLocalAreas && this.geolocation.Longitude !== undefined) {
        this.checkAreas();
        this.isWorking = false;
      }
    },
    useLocalAreas() {
      // If useLocalAreas is set to true, get geolocation and checkAreas
      if (this.useLocalAreas) {
        console.log('USELOCALAREAS SET TO TRUE');
        // If necessary get geolocation; otherwise run checkAreas
        if (this.geolocation.Longitude == undefined) {
          // Clear local areas before populating
          this.$store.commit('clearLocalArea');
          this.$store.dispatch('getGeolocation');
          // Set 'is working' until results are retrieved
          this.isWorking = true;
        }
        if (this.geolocation.Longitude !== undefined) {
          this.$store.commit('clearLocalArea');
          this.checkAreas();
        }

      }
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
