<template>
  <div class="container-fluid">
    <div class="well" >

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

      <div class="form-item form-item-name form-group">
        <label for="type" class="control-label ">Log Type</label>
        <div class="input-group">
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
      </div>

      <div id="categories" class="form-item form-group">
        <label for="log-categories" id="categories-label">Log Categories</label>
        <select-box
          small
          v-for="cat in categories"
          :id="`category-${cat.tid}-${cat.name}`"
          :selected="logs[currentLogIndex].log_category.data.some(_cat => cat.tid === _cat.id)"
          :label="cat.name"
          :key="`category-${cat.tid}-${cat.name}`"
          @input="
            $event
            ? addCategory(cat.tid)
            : removeCategory(logs[currentLogIndex].log_category.data.findIndex(_cat => cat.tid === _cat.id))"
          />
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

      <div class="well">
      </div>
    </div>
  </div>
</template>

<script>
import Autocomplete from './Autocomplete';
import IconSpinner from '../../icons/icon-spinner.vue'; // eslint-disable-line import/extensions
import ToggleCheck from './ToggleCheck.vue';
import SelectBox from './SelectBox.vue';

export default {
  name: 'EditLog',
  components: {
    Autocomplete,
    IconSpinner,
    ToggleCheck,
    SelectBox,
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
    'logs',
    'areas',
    'assets',
    'currentLogIndex',
    'statusText',
    'photoLoc',
    'geolocation',
    'localArea',
    'useGeolocation',
    'units',
    'categories',
    'equipment',
    // Set by router via edit/:type props=true
    'type',
  ],

  created() {
    if (typeof this.$route.params.index === 'number') {
      // If a log index is provided in query params, set it as current log
      this.$store.commit('setCurrentLogIndex', this.$route.params.index);
      this.existingLog = true;
    } else {
      // Create a new log.  The 'type' prop is set based on the 'type' param in the local route
      this.$store.dispatch('initializeLog', this.type);
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
      const nowStamp = (Date.now() / 1000).toFixed(0);
      let valueString = (typeof val === 'string') ? val : JSON.stringify(val);
      const newProps = {
        [key]: { data: valueString, changed: nowStamp},
        isCachedLocally: false,
        wasPushedToServer: false,
      };
      this.$store.commit('updateCurrentLog', newProps);
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
      const newProps = {
        quantity: this.logs[this.currentLogIndex].quantity,
        isCachedLocally: false,
        wasPushedToServer: false,
      };
      this.$store.commit('updateCurrentLog', newProps);
    },

    addCategory(id) {
      const catReference = { id: id, resource: 'taxonomy_term'};
      const newCategories = this.logs[this.currentLogIndex].log_category.data.concat(catReference);
      this.updateCurrentLog('log_category', newCategories);
    },

    addEquipment(id) {
      console.log('Equipment id: ', id);
      if (id !== '') {
        const equipReference = { id: id, resource: 'farm_asset'};
        const newEquipment = this.logs[this.currentLogIndex].equipment.data.concat(equipReference);
        this.updateCurrentLog('equipment', newEquipment);
      }
    },

    addAsset(id) {
      const assetReference = { id: id, resource: 'farm_asset'};
      const newAssets = this.logs[this.currentLogIndex].asset.data.concat(assetReference);
      this.updateCurrentLog('asset', newAssets);
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
        this.updateCurrentLog('geofield', location);
      }
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
    /*
      In order to avoid duplicates, filteredAssets & filteredAreas remove
      assets/areas from the array of searchable objects if they've already been
      added to the current log.
    */
    filteredAssets() {
      const selectAssetRefs = this.logs[this.currentLogIndex].asset.data;
      return this.assets.filter(asset =>
        !selectAssetRefs.some(selAsset => asset.id === selAsset.id),
      );
    },
    filteredAreas() {
      if (this.logs[this.currentLogIndex].area) {
        const selectAreaRefs = this.logs[this.currentLogIndex].area.data;
        return this.areas.filter(area =>
          !selectAreaRefs.some(selArea => area.tid === selArea.tid),
        );
      } else {
        return []
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
  },

  watch: {
    // When photoLoc changes, this updates the images property of the current log
    photoLoc() {
      this.updateCurrentLog('images', this.photoLoc);
    },
    geolocation() {
      // When geolocation is set, EITHER set geofield OR select areas based on location
      if (this.attachGeo && this.geolocation.Longitude !== undefined) {
        const location = JSON.parse(`[{"geom":"POINT (${this.geolocation.Longitude} ${this.geolocation.Latitude})"}]`);
        this.updateCurrentLog('geofield', location);
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

  #categories {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
  }

  #categories-label {
    flex: 1 0 100%;
  }

</style>
