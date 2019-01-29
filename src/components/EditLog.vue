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

      <!-- We're using a radio button to choose whether areas are selected
      automatically based on device location, or using an Autocomplete.
      This will use the useGeoAreas conditional var -->
      <div class="form-check">
        <input
        v-model="useGeoArea"
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
        v-model="useGeoArea"
        type="radio"
        class="form-check-input"
        id="doUseGeo"
        name="geoRadioGroup"
        v-bind:value="true"
        >
        <label class="form-check-label" for="doUseGeo">Use my location</label>
      </div>

      <!-- Show localArea OR search autocomplete depending on selection -->
      <ChooseObjectFromArray
        v-if="useGeoArea && geolocation !== {}"
        :objects="localArea"
        objectName="name"
        label="Areas near your current location"
        :isWorking="isWorking"
        workingLabel="Getting your current location..."
        v-on:choices="updateCurrentLog('field_farm_area', $event)">
        <template slot="empty">
          <div class="empty-slot">
            <em>No areas found near your location.</em>
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
      </ChooseObjectFromArray>

      <Autocomplete
        v-if="!useGeoArea"
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
      <p> {{ attachLocLabel }} </p>


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
import ChooseObjectFromArray from './ChooseObjectFromArray';

export default {
  components: {
    Autocomplete,
    ChooseObjectFromArray,
  },

  data() {
    return {
      imageUrls: [],
      attachGeo: false,
      useGeoArea: false,
      attachLocLabel: "",
      addedArea: false,
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
    'localArea',
  ],

  created() {
    // Inititialize the log, default to "Observation"
    this.$store.dispatch('initializeLog', 'farm_observation');
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

    addLocation() {
      this.$store.dispatch('getGeolocation');
      this.attachGeo = true;
      this.attachLocLabel = 'Getting current GPS location...';
      this.$store.commit('setIsWorking', true);
    },

    checkAreas() {
      console.log("CALLED CHECKAREAS; DOING CHECKINSIDE");
      // Use checkInside in geoModule with each area to see if the current location is inside an area
      let insideArea = false;
      this.areas.forEach((area) => {
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
      if (this.attachGeo && this.geolocation !== {}) {
        const location = JSON.parse("[{\"geom\":\"POINT ("+this.geolocation.Longitude+" "+this.geolocation.Latitude+")\"}]");
        console.log(`ATTACH GEOLOCATION: ${location}`)
        this.updateCurrentLog('field_farm_geofield', location);
        this.attachGeo = false;
        this.attachLocLabel = `Current location is Lon: ${this.geolocation.Longitude}, Lat: ${this.geolocation.Latitude}`;
        this.$store.commit('setIsWorking', false);
      } else {
        this.checkAreas();
        this.$store.commit('setIsWorking', false);
      }
    },
    useGeoArea() {
      // If useGeoArea is set to true, get geolocation and checkAreas
      if(this.useGeoArea) {
        console.log('USEGEOAREA SET TO TRUE');
        // Clear local areas before populating
        this.$store.commit('clearLocalArea');
        this.$store.dispatch('getGeolocation');
        // Set 'is working' until results are retrieved
        this.$store.commit('setIsWorking', true);
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
