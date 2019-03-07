<template>
  <div>
    <h1>Edit Log</h1>
    <div class="well" >

      <br>
      <div class="form-item form-group">
        <toggle-check
          label="Done"
          labelPosition="after"
          :checked="logs[currentLogIndex].done"
          @input="updateCurrentLog('done', $event)"/>
      </div>

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
        <div class="input-group">
          <select
            :value="logs[currentLogIndex].type"
            @input="updateCurrentLog('type', $event.target.value)"
            class="custom-select col-sm-3 ">
              <!-- options are defined in the local logTypes variable -->
              <option
                v-for="(typeName, typeKey) in logTypes"
                :value="typeKey"
                v-bind:key="`${typeName}-${typeKey}`">
                {{ typeName }}
              </option>
          </select>
        </div>
      </div>

      <div class="form-item form-item-name form-group">
        <label for="notes" class="control-label ">Notes</label>
        <textarea
          :value="logs[currentLogIndex].notes"
          @input="updateCurrentLog('notes', $event.target.value)"
          placeholder="Enter notes"
          type="text"
          class="form-control">
        </textarea>
      </div>

      <h4>Assets</h4>
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

      <div class="form-item form-item-name form-group">
        <ul class="list-group">
          <li
            v-for="(asset, i) in logs[currentLogIndex].field_farm_asset"
            v-bind:key="`log-${i}-${Math.floor(Math.random() * 1000000)}`"
            class="list-group-item">
            {{ asset.name }}
            <span class="remove-list-item" @click="removeAsset(asset)">
              &#x2715;
            </span>
          </li>
        </ul>
      </div>

      <h4>Areas &amp; Location</h4>
      <!-- We're using a radio button to choose whether areas are selected
      automatically based on device location, or using an Autocomplete.
      This will use the useLocalAreas conditional var -->
      <div  v-if="useGeolocation" class="form-item form-item-name form-group">
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
            :value="area.tid"
            v-bind:key="`area-${area.tid}`">
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
      <div class="form-item form-item-name form-group">
        <ul class="list-group">
          <li
            v-for="(area, i) in logs[currentLogIndex].field_farm_area"
            v-bind:key="`log-${i}-${Math.floor(Math.random() * 1000000)}`"
            class="list-group-item">
            {{ area.name }}
            <span class="remove-list-item" @click="removeArea(area)">
              &#x2715;
            </span>
          </li>
        </ul>
      </div>


      <!-- We're using a button to attach the current location to the log
      as a field_farm_geofield -->

      <div v-if="useGeolocation" class="form-item form-item-name form-group">
        <button
          :disabled='false'
          title="Add my GPS location to the log"
          @click="addLocation"
          type="button"
          class="btn btn-success btn-navbar">
          Add my GPS location to the log
        </button>
      </div>

      <!-- Display a spinner while getting geolocation, then display the location -->
      <div class="form-item form-item-name form-group">
        <ul class="list-group">
          <li
            class="list-group-item"
            v-if="logs[currentLogIndex].field_farm_geofield.length > 0">
            {{ logs[currentLogIndex].field_farm_geofield[0].geom }}
            <span class="remove-list-item" @click="updateCurrentLog('field_farm_geofield', [])">
              &#x2715;
            </span>
          </li>
          <li class="list-item-group" v-if="attachGeo && isWorking">
            <icon-spinner/>
          </li>
        </ul>
      </div>

      <h4>Images</h4>

      <div class="form-item form-item-name form-group">
        <button
          :disabled='false'
          title="Take picture with camera"
          @click="getPhoto"
          class="btn btn-info btn-navbar navbar-right"
          type="button">
          Take picture with camera
        </button>
      </div>

      <div class="form-item form-item-name form-group">
        <div class="input-group ">
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
      </div>
      <div class="form-item form-item-name form-group">
        <img
          v-for="url in imageUrls"
          :src="url"
          :key="`preview-${imageUrls.indexOf(url)}`"
          class="preview" />
      </div>

      <div class="input-group">
        <router-link :to="'/logs'">
          <button
            :disabled='false'
            title="Done Editing"
            type="button"
            class="btn btn-success btn-lg">
            Done Editing
          </button>
        </router-link>
      </div>
      <br>
      <div class="well">
      </div>
    </div>
  </div>
</template>

<script>
import Autocomplete from './Autocomplete';
import IconSpinner from '../../icons/icon-spinner.vue'; // eslint-disable-line import/extensions
import ToggleCheck from './ToggleCheck.vue';

export default {
  components: {
    Autocomplete,
    IconSpinner,
    ToggleCheck,
  },

  data() {
    return {
      imageUrls: [],
      attachGeo: false,
      useLocalAreas: false,
      addedArea: false,
      isWorking: false,
      existingLog: false,
      // All types available to the log, with system_name:display name as key:value
      logTypes: {
        farm_observation: 'Observation',
        farm_activity: 'Activity',
        farm_input: 'Input',
        farm_harvest: 'Harvest',
        farm_seeding: 'Seeding',
      },
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
    'useGeolocation',
    // Set by router via edit/:type props=true
    'type',
  ],

  created() {
    if (typeof this.$route.params.index === 'number') {
      // If a log index is provided in query params, set it as current log
      this.$store.commit('setCurrentLogIndex', this.$route.params.index);
      console.log(`SETTING CURRENT LOG INDEX AS ${this.$route.params.index}`);
      this.existingLog = true;
    } else {
      // Create a new log.  The 'type' prop is set based on the 'type' param in the local route
      this.$store.dispatch('initializeLog', this.type);
      console.log(`LOG IS RECEIVING TYPE AS ${this.type}`);
    }
  },

  methods: {

    convertOutOfUnix(unixTimestamp) {
      const date = new Date(unixTimestamp * 1000);
      const dateFix = d => ((d < 10) ? `0${d}` : d);
      const mm = dateFix(date.getMonth() + 1);
      const dd = dateFix(date.getDate());
      return `${date.getFullYear()}-${mm}-${dd}`;
    },

    convertIntoUnix(nonUnixTimestamp) {
      const year = +nonUnixTimestamp.split('-')[0];
      const monthIndex = +nonUnixTimestamp.split('-')[1] - 1;
      const date = +nonUnixTimestamp.split('-')[2];
      return Math.floor(new Date(year, monthIndex, date).getTime() / 1000).toString();
    },

    forceSync() {
      this.$store.dispatch('forceSyncAssetsAndAreas');
    },

    updateCurrentLog(key, val) {
      console.log('CURRENT LOG IS ',this.logs[this.currentLogIndex]);
      const newProps = {
        [key]: val,
        isCachedLocally: false,
        wasPushedToServer: false,
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
      if (tid !== '') {
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
      // Get geolocation if necessary; otherwise add geolocation
      if (this.geolocation.Longitude === undefined) {
        this.$store.dispatch('getGeolocation');
        this.attachGeo = true;
        this.isWorking = true;
      }
      if (this.geolocation.Longitude !== undefined) {
        this.attachGeo = true;
        const location = JSON.parse(`[{"geom":"POINT (${this.geolocation.Longitude} ${this.geolocation.Latitude})"}]`);
        console.log(`ATTACH GEOLOCATION: ${location}`);
        this.updateCurrentLog('field_farm_geofield', location);
      }
    },

    checkAreas() {
      console.log('CALLED CHECKAREAS; DOING CHECKINSIDE');
      // Use checkInside with each area to see if the current location is inside an area
      this.filteredAreas.forEach((area) => {
        if (area.field_farm_geofield[0] !== undefined && this.geolocation.Longitude !== undefined) {
          // If the current location is inside an area, add the area to the log
          const lonlat = [this.geolocation.Longitude, this.geolocation.Latitude];
          // checkInNear requires a point, an area, and a radius around the point in kilometers
          const areaProps = { point: lonlat, area, radius: 0.02 };
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
      const selectedAssets = this.logs[this.currentLogIndex].field_farm_asset;
      return this.assets.filter(asset =>
        !selectedAssets.some(selAsset => asset.id === selAsset.id),
      );
    },
    filteredAreas() {
      const selectedAreas = this.logs[this.currentLogIndex].field_farm_area;
      return this.areas.filter(area =>
        !selectedAreas.some(selArea => area.tid === selArea.tid),
      );
    },

  },

  watch: {
    // When photoLoc changes, this updates the images property of the current log
    photoLoc() {
      console.log(`UPDATING CURRENT RECORD PHOTO LOC: ${this.photoLoc}`);
      this.updateCurrentLog('images', this.photoLoc);
    },
    geolocation() {
      // When geolocation is set, EITHER set field_farm_geofield OR select areas based on location
      if (this.attachGeo && this.geolocation.Longitude !== undefined) {
        const location = JSON.parse(`[{"geom":"POINT (${this.geolocation.Longitude} ${this.geolocation.Latitude})"}]`);
        console.log(`ATTACH GEOLOCATION: ${location}`);
        this.updateCurrentLog('field_farm_geofield', location);
        this.isWorking = false;
        // If we are getting local areas
      }
      if (this.useLocalAreas && this.geolocation.Longitude !== undefined) {
        this.checkAreas();
        this.isWorking = false;
      }
    },
    useLocalAreas() {
      // If useLocalAreas is set to true, get geolocation and checkAreas
      if (this.useLocalAreas) {
        console.log('USELOCALAREAS SET TO TRUE');
        // If necessary get geolocation; otherwise run checkAreas
        if (this.geolocation.Longitude === undefined) {
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

    // This catches route changes from `/log/edit` to `/log/edit` and creates
    // a new log by the same procedure as in the `created()` hook.
    $route(to) {
      if (typeof to.params.index === 'number') {
        // If a log index is provided in query params, set it as current log
        this.$store.commit('setCurrentLogIndex', this.$route.params.index);
      } else {
        // Create a new log.  The 'type' prop is set based on the 'type' param in the local route
        this.$store.dispatch('initializeLog', this.type);
        console.log(`LOG IS RECEIVING TYPE AS ${this.type}`);
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

  .remove-list-item {
    float: right;
  }

</style>
