<template>
<div class="tab-container">
  <div class="tab-bar">
    <div
      class="tab"
      :class="{ selected: tabSelected === 'FIRST' }"
      @click="tabSelected = 'FIRST'">
      <h5>GENERAL</h5>
    </div>
    <div
      class="tab"
      :class="{ selected: tabSelected === 'SECOND' }"
      @click="tabSelected = 'SECOND'">
      <h5>MOVEMENT</h5>
    </div>
  </div>
  <div
    class="tab-indicator"
    :class="[
      {first: tabSelected === 'FIRST' },
      {second: tabSelected === 'SECOND' },
    ]"/>

  <div
    class="container-fluid tab-content first"
    :class="{ selected: tabSelected === 'FIRST' }">

    <br>
    <div class="form-item form-group">
      <toggle-check
        label="Done"
        labelPosition="after"
        :checked="logs[currentLogIndex].done.data"
        @input="updateCurrentLog('done', $event)"/>
    </div>

    <div class="form-item form-item-name form-group">
      <label for="name" class="control-label">Name</label>
      <input
        :value="logs[currentLogIndex].name.data"
        @input="updateCurrentLog('name', $event.target.value)"
        placeholder="Enter name"
        type="text"
        class="form-control"
        autofocus>
    </div>

    <div class="form-item form-item-name form-group">
      <label for="Date" class="control-label">Date</label>
      <input
        :value="convertOutOfUnix(logs[currentLogIndex].timestamp.data)"
        @input="updateCurrentLog('timestamp', convertIntoUnix($event.target.value))"
        type="date"
        class="form-control">
    </div>
    <!-- Allow users to change type for logs that have not yet been sent to the server
    For logs currently on the server, display type as text -->
    <div class="form-item form-item-name form-group">
      <label for="type" class="control-label ">Log Type</label>
      <div class="input-group" v-if="(logs[currentLogIndex].id === undefined)">
        <select
          :value="logs[currentLogIndex].type.data"
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
      <div class="form-item" v-if="!(logs[currentLogIndex].id === undefined)">
        <p> {{ logTypes[logs[currentLogIndex].type.data] }} </p>
      </div>
    </div>


    <div class="form-item form-item-name form-group">
      <label for="notes" class="control-label ">Notes</label>
      <textarea
        :value="logs[currentLogIndex].notes.data"
        @input="updateCurrentLog('notes', $event.target.value)"
        placeholder="Enter notes"
        type="text"
        class="form-control">
      </textarea>
    </div>

    <h4>Log Categories</h4>
    <div id="categories" class="form-item form-group">
      <p v-if="!showAllCategories && logs[currentLogIndex].log_category.data.length < 1">No categories selected</p>
      <select-box
        small
        v-for="cat in categories"
        v-if="showAllCategories || logs[currentLogIndex].log_category.data.some(_cat => cat.tid === _cat.id)"
        :id="`category-${cat.tid}-${cat.name}`"
        :selected="logs[currentLogIndex].log_category.data.some(_cat => cat.tid === _cat.id)"
        :label="cat.name"
        :key="`category-${cat.tid}-${cat.name}`"
        @input="
          $event
          ? addCategory(cat.tid)
          : removeCategory(logs[currentLogIndex].log_category.data.findIndex(_cat => cat.tid === _cat.id))"
        />
      <div class="show-hide">
        <div v-if="!showAllCategories" @click="showAllCategories = !showAllCategories">
          <p><icon-expand-more/>Show More</p>
        </div>
        <div v-if="showAllCategories" @click="showAllCategories = !showAllCategories">
          <p><icon-expand-less/>Show Less</p>
        </div>
      </div>
    </div>

    <h4>Quantities</h4>
    <label for="quantity" class="control-label ">Add new or edit existing quantity</label>
    <div class="form-item form-item-name form-group">
      <select
        :value="(logs[currentLogIndex].quantity.data.length > 0) ? logs[currentLogIndex].quantity.data[logs[currentLogIndex].quantity.data.length -1].measure : ''"
        @input="updateNewQuant('measure', $event.target.value)"
        placeholder="Quantity measure"
        class="custom-select col-sm-3 ">
          <option
            v-for="measure in quantMeasures"
            :value="measure">
            {{ measure }}
          </option>
      </select>
      <input
        :value="(logs[currentLogIndex].quantity.data.length > 0) ? logs[currentLogIndex].quantity.data[logs[currentLogIndex].quantity.data.length -1].value : 0"
        @input="updateNewQuant('value', $event.target.value)"
        placeholder="Quantity value"
        type="number"
        class="form-control">
      </input>
      <select
        @input="updateNewQuant('unit', $event.target.value)"
        placeholder="Quantity unit"
        class="custom-select col-sm-3 ">
          <option
            v-for="unit in units"
            :value="unit.tid">
            {{ (units) ? unit.name : '' }}
          </option>
      </select>
      <input
        :value="(logs[currentLogIndex].quantity.data.length > 0) ? logs[currentLogIndex].quantity.data[logs[currentLogIndex].quantity.data.length -1].label : ''"
        @input="updateNewQuant('label', $event.target.value)"
        placeholder="Quantity label"
        type="text"
        class="form-control">
      </input>
    </div>

    <div class="form-item form-group">
      <ul v-if="logs[currentLogIndex].quantity.data.length > 0" class="list-group">
        <li
          v-for="(quant, i) in logs[currentLogIndex].quantity.data"
          v-bind:key="`quantity-${i}-${Math.floor(Math.random() * 1000000)}`"
          class="list-group-item">
          {{ quant.value }} {{ (quantUnitNames.length > 0) ? quantUnitNames[i] : '' }} {{ quant.label }}
          <span class="remove-list-item" @click="removeQuant(i)">
            &#x2715;
          </span>
        </li>
      </ul>
    </div>

    <div class="form-item form-group">
      <button
        type="button"
        class="btn btn-success"
        @click="addQuant"
        name="addNewQuantity">
        Add another quantity
      </button>
    </div>

    <h4>Assets</h4>
    <Autocomplete
      :objects="filteredAssets"
      searchKey="name"
      searchId="id"
      :label="assetsRequired() ? 'Seedings must include assets!' : 'Add assets to the log'"
      :class="{ invalid: assetsRequired() }"
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
          v-for="(asset, i) in selectedAssets"
          v-bind:key="`log-${i}-${Math.floor(Math.random() * 1000000)}`"
          class="list-group-item">
          {{ asset.name }}
          <span class="remove-list-item" @click="removeAsset(asset)">
            &#x2715;
          </span>
        </li>
      </ul>
    </div>

    <div class="form-item form-item-name form-group">
      <label for="type" class="control-label ">Equipment</label>
      <div class="input-group">
        <select
          @input="addEquipment($event.target.value)"
          class="custom-select col-sm-3 ">
          <option value=""></option>
          <option
            v-for="equip in equipment"
            :value="equip.id">
            {{ (equip) ? equip.name : '' }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-item form-group">
      <ul v-if="logs[currentLogIndex].equipment" class="list-group">
        <li
          v-for="(equip, i) in logs[currentLogIndex].equipment.data"
          v-bind:key="`log-${i}-${Math.floor(Math.random() * 1000000)}`"
          class="list-group-item">
          {{ (equipmentNames.length > 0) ? equipmentNames[i] : '' }}
          <span class="remove-list-item" @click="removeEquipment(i)">
            &#x2715;
          </span>
        </li>
      </ul>
    </div>

    <div
      v-if="!(logs[currentLogIndex].type.data === 'farm_seeding')"
      id="areas-and-location">
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
            v-for="(area, i) in selectedAreas"
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
      as a geofield -->

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
            v-for="geofield in logs[currentLogIndex].geofield.data"
            v-if="showGeofieldData(geofield)">
            {{ geofield.geom }}
            <span class="remove-list-item" @click="updateCurrentLog('geofield', [])">
              &#x2715;
            </span>
          </li>
          <li class="list-item-group" v-if="attachGeo && isWorking">
            <icon-spinner/>
          </li>
        </ul>
      </div>
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

  </div>

  <div
    class="container-fluid tab-content second"
    :class="{ selected: tabSelected === 'SECOND' }">

    <br>
    <Autocomplete
      :objects="filteredAssets"
      searchKey="name"
      searchId="id"
      :label="assetsRequired() ? 'Seedings must include assets!' : 'Add assets to be moved'"
      :class="{ invalid: assetsRequired() }"
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
          v-for="(asset, i) in selectedAssets"
          v-bind:key="`asset-${i}-${Math.floor(Math.random() * 1000000)}`"
          class="list-group-item">
          {{ asset.name }}
          <span class="remove-list-item" @click="removeAsset(asset)">
            &#x2715;
          </span>
        </li>
      </ul>
    </div>

    <Autocomplete
      :objects="filteredMovementAreas"
      searchKey="name"
      searchId="tid"
      label="Movement to"
      v-on:results="addMovementArea($event)">
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

    <div class="form-item form-item-name form-group">
      <ul class="list-group">
        <li
          v-for="(area, i) in selectedMovementAreas"
          v-bind:key="`log-${i}-${Math.floor(Math.random() * 1000000)}`"
          class="list-group-item">
          {{ area.name }}
          <span class="remove-list-item" @click="removeMovementArea(area)">
            &#x2715;
          </span>
        </li>
      </ul>
    </div>

    <router-link :to="{ name: 'edit-map' }">
      <Map
        id="map"
        :overrideStyles="{ height: '90vw' }"
        :options="{
          controls: (defaults) => defaults.filter(def => def.constructor.name === 'Attribution'),
          interactions: false,
        }"
        :wkt="{
          title: 'movement',
          wkt: logs[currentLogIndex].movement.data.geometry,
          color: 'orange',
        }"
        :geojson="{
          title: 'areas',
          url: areaGeoJSON,
          color: 'grey',
        }"/>
    </router-link>

    <br>

  </div>
</div>
</template>

<script>
import Autocomplete from './Autocomplete';
import IconExpandLess from '../../icons/icon-expand-less.vue'; // eslint-disable-line import/extensions
import IconExpandMore from '../../icons/icon-expand-more.vue'; // eslint-disable-line import/extensions
import IconSpinner from '../../icons/icon-spinner.vue'; // eslint-disable-line import/extensions
import Map from './Map';
import ToggleCheck from './ToggleCheck.vue';
import SelectBox from './SelectBox.vue';
import { mergeGeometries, removeGeometry } from '../../utils/geometry.js';

export default {
  name: 'EditLog',
  components: {
    Autocomplete,
    IconExpandLess,
    IconExpandMore,
    IconSpinner,
    Map,
    ToggleCheck,
    SelectBox,
  },

  data() {
    return {
      tabSelected: 'FIRST',
      imageUrls: [],
      attachGeo: false,
      useLocalAreas: false,
      addedArea: false,
      isWorking: false,
      showAllCategories: false,
      // All types available to the log, with system_name:display name as key:value
      logTypes: {
        farm_observation: 'Observation',
        farm_activity: 'Activity',
        farm_input: 'Input',
        farm_harvest: 'Harvest',
        farm_seeding: 'Seeding',
      },
      quantMeasures: [
        'count',
        'length',
        'weight',
        'area',
        'volume',
        'time',
        'temperature',
        'water_content',
        'value',
        'rating',
        'ratio',
        'probability',
      ],
    };
  },

  props: [
    'id',
    'logs',
    'areas',
    'assets',
    'statusText',
    'localArea',
    'useGeolocation',
    'units',
    'categories',
    'equipment',
  ],

  beforeMount() {
    if (this.$router.currentRoute.params.tab) {
      this.tabSelected = this.$router.currentRoute.params.tab;
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
      if (localStorage.getItem('host') !== null) {
        this.$store.dispatch('updateAssets');
        this.$store.dispatch('updateAreas');
        return;
      }
      this.$router.push('/login');
    },

    updateCurrentLog(key, val) {
      const nowStamp = (Date.now() / 1000).toFixed(0);
      let valueString = (typeof val === 'string') ? val : JSON.stringify(val);
      const props = {
        [key]: { data: valueString, changed: nowStamp },
        isCachedLocally: false,
        wasPushedToServer: false,
      };
      this.$store.commit('updateLog', { index: this.currentLogIndex, props});
    },

    updateNewQuant(key, value) {
      const quantLength = this.logs[this.currentLogIndex].quantity.data.length;
      // If no quantities exist at the newQuantIndex, create a new one!
      if (quantLength === 0){
        this.addQuant();

      }
      if (key === 'unit') {
        const unitRef = {id: value, resource: 'taxonomy_term'}
        this.logs[this.currentLogIndex].quantity.data[quantLength - 1][key] = unitRef;
      } else {
        this.logs[this.currentLogIndex].quantity.data[quantLength - 1][key] = value;
      }
      // now update the log in the store
      const props = {
        quantity: this.logs[this.currentLogIndex].quantity,
        isCachedLocally: false,
        wasPushedToServer: false,
      };
      this.$store.commit('updateLog', { index: this.currentLogIndex, props });
    },

    addCategory(id) {
      const catReference = { id, resource: 'taxonomy_term'};
      const newCategories = this.logs[this.currentLogIndex].log_category.data.concat(catReference);
      this.updateCurrentLog('log_category', newCategories);
    },

    addEquipment(id) {
      if (id !== '') {
        const equipReference = { id, resource: 'farm_asset'};
        const newEquipment = this.logs[this.currentLogIndex].equipment.data.concat(equipReference);
        this.updateCurrentLog('equipment', newEquipment);
      }
    },

    addAsset(id) {
      const assetReference = { id, resource: 'farm_asset'};
      const newAssets = this.logs[this.currentLogIndex].asset.data.concat(assetReference);
      this.updateCurrentLog('asset', newAssets);
    },

    addMovementArea(id) {
      const areaReference = { id, resource: 'farm_area'};
      const areaGeometry = this.areas.find(area => area.tid === id).geofield[0].geom;
      const prevGeometry = this.logs[this.currentLogIndex].movement.data.geometry;
      const newGeometry = mergeGeometries([areaGeometry, prevGeometry]);
      const newMovement = {
        area: this.logs[this.currentLogIndex].movement.data.area.concat(areaReference),
        geometry: newGeometry,
        };
      this.updateCurrentLog('movement', newMovement);
    },

    addArea(id) {
      if (id !== '') {
        const areaReference = { id: id, resource: 'farm_area'};
        const newAreas = this.logs[this.currentLogIndex].area.data.concat(areaReference);
        this.updateCurrentLog('area', newAreas);
        this.checkAreas();
      }
      this.checkAreas();
    },

    addQuant() {
      const quanTemplate = {
        measure: 'weight',
        value: 0,
        unit: {id: 0, resource: 'taxonomy_term'},
        label: '',
      };
      this.logs[this.currentLogIndex].quantity.data.push(quanTemplate);
    },

    removeAsset(asset) {
      const newAssets = this.logs[this.currentLogIndex].asset.data
        .filter(_asset => _asset.id !== asset.id);
      this.updateCurrentLog('asset', newAssets);
    },

    removeArea(area) {
      const newAreas = this.logs[this.currentLogIndex].area.data
        .filter(_area => _area.id !== area.tid);
      this.updateCurrentLog('area', newAreas);
    },

    removeMovementArea(area) {
      const newAreas = this.logs[this.currentLogIndex].movement.data.area
        .filter(_area => _area.id !== area.tid);
      const prevGeometry = this.logs[this.currentLogIndex].movement.data.geometry;
      const areaGeometry = area.geofield[0].geom;
      const newGeometry = removeGeometry(prevGeometry, areaGeometry);
      const newMovement = {
        geometry: newGeometry,
        area: newAreas,
      }
      this.updateCurrentLog('movement', newMovement);
    },

    removeQuant(index) {
      const newQuant = this.logs[this.currentLogIndex].quantity.data;
      newQuant.splice(index, 1);
      this.updateCurrentLog('quantity', newQuant);
    },

    removeCategory(index) {
      const newCat = this.logs[this.currentLogIndex].log_category.data;
      newCat.splice(index, 1);
      this.updateCurrentLog('category', newCat);
    },

    removeEquipment(index) {
      const newEquip = this.logs[this.currentLogIndex].equipment.data;
      newEquip.splice(index, 1);
      this.updateCurrentLog('equipment', newEquip);
    },

    getPhoto() {
      // Obtains an image location from the camera!
      return this.$store.dispatch('getPhotoFromCamera', this.currentLogIndex);
    },

    loadPhoto(files) {
      for (let i = 0; i < files.length; i += 1) {
        this.imageUrls.push(window.URL.createObjectURL(files[i]));
        this.$store.dispatch('loadPhotoBlob', {
          file: files[i],
          index: this.currentLogIndex,
          });
      }
    },

    addLocation() {
      function addGeofield(position) {
        const props = this.logs[this.currentLogIndex].geofield.data.concat({
          geom: `POINT (${position.coords.longitude} ${position.coords.latitude})`
        });
        this.updateCurrentLog('geofield', props);
        this.isWorking = false;
      }
      function onError({ message }) {
        const errorPayload = { message, level: 'warning', show: false, };
        this.$store.commit('logError', errorPayload);
        this.isWorking = false;
      }
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
      };

      this.isWorking = true;
      navigator.geolocation.getCurrentPosition(
        addGeofield.bind(this),
        onError.bind(this),
        options,
      );
    },

    checkAreas() {
      // Use checkInside with each area to see if the current location is inside an area
      this.filteredAreas.forEach((area) => {
        if (area.geofield[0] !== undefined && this.geolocation.Longitude !== undefined) {
          // If the current location is inside an area, add the area to the log
          const lonlat = [this.geolocation.Longitude, this.geolocation.Latitude];
          // checkInNear requires a point, an area, and a radius around the point in kilometers
          const areaProps = { point: lonlat, area, radius: 0.02 };
          // This is the problem!  Dispatch isn't working...
          this.$store.dispatch('checkInNear', areaProps);
        }
      });
    },

    getAttached(attribute, resources, resId) {
        const logAttached = [];
        resources.forEach((resrc) => {
          attribute.forEach((attrib) => {
            if (resrc[resId] === attrib.id) {
              logAttached.push(resrc);
            }
          });
        });
        return logAttached;
    },
    assetsRequired() {
      return this.logs[this.currentLogIndex].type.data === 'farm_seeding' && this.selectedAssets < 1;
    },
    showGeofieldData(geofield) {
      const log = this.logs[this.currentLogIndex]
      return log.geofield && log.geofield.data.length > 0 && !geofield.geom.includes('POLYGON');
    },
  },

  computed: {
    currentLogIndex() {
      const index = this.logs.findIndex(log => log.local_id === +this.id);
      return index >= 0 ? index : 0;
    },
    /*
      In order to avoid duplicates, filteredAssets & filteredAreas remove
      assets/areas from the array of searchable objects if they've already been
      added to the current log.
    */
    filteredAssets() {
      if (this.logs[this.currentLogIndex].asset){
        const selectAssetRefs = this.logs[this.currentLogIndex].asset.data;
        return this.assets.filter(asset =>
          !selectAssetRefs.some(selAsset => asset.id === selAsset.id),
        );
      } else {
        return this.assets;
      }
    },
    filteredAreas() {
      if (this.logs[this.currentLogIndex].area) {
        const selectAreaRefs = this.logs[this.currentLogIndex].area.data;
        return this.areas.filter(area =>
          !selectAreaRefs.some(selArea => area.tid === selArea.id),
        );
      } else {
        return this.areas;
      }
    },
    filteredMovementAreas() {
      if (this.logs[this.currentLogIndex].movement.data.area) {
        const selectAreaRefs = this.logs[this.currentLogIndex].movement.data.area;
        return this.areas.filter(area =>
          !selectAreaRefs.some(selArea => area.tid === selArea.id),
        );
      } else {
        return this.areas;
      }
    },
    selectedAssets() {
      if (this.logs[this.currentLogIndex].asset) {
        return this.getAttached(this.logs[this.currentLogIndex].asset.data, this.assets, 'id');
      }
    },
    selectedAreas() {
      if (this.logs[this.currentLogIndex].area) {
        return this.getAttached(this.logs[this.currentLogIndex].area.data, this.areas, 'tid');
      }
    },
    selectedMovementAreas() {
      if (this.logs[this.currentLogIndex].movement.data.area) {
        return this.getAttached(
          this.logs[this.currentLogIndex].movement.data.area,
          this.areas,
          'tid',
          );
      }
    },
    quantUnitNames() {
      if (this.units.length > 0 && this.logs[this.currentLogIndex].quantity.data.length > 0) {
        let unitNames = []
        this.logs[this.currentLogIndex].quantity.data.forEach((quant) => {
          if (quant.unit) {
            this.units.forEach((unit) => {
              if (parseInt(unit.tid, 10) === parseInt(quant.unit.id, 10)) {
                unitNames.push(unit.name);
              }
            });
          }
        });
        return unitNames;
      }
      return [];
    },
    categoryNames() {
      if (this.categories.length > 0 && this.logs[this.currentLogIndex].log_category.data.length > 0) {
        let catNames = []
        this.logs[this.currentLogIndex].log_category.data.forEach((logCat) => {
          this.categories.forEach((cat) => {
            if (parseInt(cat.tid, 10) === parseInt(logCat.id, 10)) {
              catNames.push(cat.name);
            }
          });
        });
        return catNames;
      }
      return [];
    },
    equipmentNames() {
      if (this.equipment.length > 0 && this.logs[this.currentLogIndex].equipment && this.logs[this.currentLogIndex].equipment.data.length > 0) {
        let equipNames = []
        this.logs[this.currentLogIndex].equipment.data.forEach((logEquip) => {
          this.equipment.forEach((equip) => {
            if (parseInt(equip.id, 10) === parseInt(logEquip.id, 10)) {
              equipNames.push(equip.name);
            }
          });
        });
        return equipNames;
      }
      return [];
    },
    areaGeoJSON() {
      return (process.env.NODE_ENV === 'development')
        ? 'http://localhost:8080/farm/areas/geojson/all'
        : `${localStorage.getItem('host')}/farm/areas/geojson/all`
    },
  },

  watch: {
    useLocalAreas() {
      // If useLocalAreas is set to true, get geolocation and checkAreas
      if (this.useLocalAreas) {
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

  },
};

</script>

<style scoped>
  .tab-container {
    position: relative;
    height: calc(100vh - 3rem);
    width: 100vw;
    overflow-x: hidden;
  }

  .tab-bar {
    display: flex;
    flex-flow: row nowrap;
    position: fixed;
    top: 3rem;
    height: 3rem;
    width: 100%;
    z-index: 1000;
    background-color: var(--farmos-green-dark);
    box-shadow: -2px 0px 15px rgba(0, 0, 0, .5);
  }

  .tab {
    font-size: 1rem;
    line-height: 1.5rem;
    color: white;
    transition: color .5s;
    flex: 1 0 50%;
    text-align: center;
    padding-top: 1rem;
  }

  .tab:not(.selected) {
    color: rgba(255, 255, 255, .5);
    transition: color .5s;
  }

  .tab-indicator {
    position: fixed;
    top: calc(6rem - 2px);
    z-index: 1001;
    height: 2px;
    width: 50%;
    background-color: white;
  }

  .tab-indicator.first {
    transition: left .5s;
    left: calc(25% - 25%);
  }

  .tab-indicator.second {
    transition: left .5s;
    left: calc(75% - 25%);
  }

  .tab-content {
    position: absolute;
    width: 100vw;
    top: 3rem;
  }

  .tab-content.selected {
    transition: left .5s;
    left: 0;
  }

  .tab-content.first:not(.selected) {
    transition: left .5s;
    left: -100vw;
  }

  .tab-content.second:not(.selected) {
    transition: left .5s;
    left: 100vw;
  }

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

  #categories {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
  }

  #categories-label {
    flex: 1 0 100%;
  }

  #categories p {
    font-style: italic;
  }

  .show-hide {
    flex: 1 0 100%;
  }

  .show-hide p {
    font-size: 1rem;
  }

  .show-hide svg {
    vertical-align: bottom;
  }

</style>
