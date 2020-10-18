<template>
<farm-tabs
  :tabs="['General', 'Movement']"
  :initTab="$router.currentRoute.params.tab">

  <template #general>
    <div class="container-fluid">

      <br>
      <div class="form-item form-group">
        <farm-toggle-check
          :label="$t('Done')"
          labelPosition="after"
          :checked="currentLog.done"
          @input="updateCurrentLog('done', $event)"/>
      </div>

      <div class="form-item form-item-name form-group">
        <label for="name" class="control-label">{{ $t('Name') }}</label>
        <input
          :value="currentLog.name"
          @input="updateCurrentLog('name', $event.target.value)"
          :placeholder="$t('Enter name')"
          type="text"
          class="form-control"
          maxlength="250"
          autofocus>
      </div>

      <farm-date-time-form
        :timestamp="currentLog.timestamp"
        @input="updateCurrentLog('timestamp', $event)"/>

      <!-- Allow users to change type for logs that have not yet been sent to the server
      For logs currently on the server, display type as text -->
      <div class="form-item form-item-name form-group">
        <label for="type" class="control-label ">{{ $t('Log Type') }}</label>
        <div class="input-group" v-if="(currentLog.id === undefined)">
          <select
            :value="currentLog.type"
            @input="updateCurrentLog('type', $event.target.value)"
            class="custom-select col-sm-3 ">
              <!-- options are defined in the local logTypes variable -->
              <option
                v-for="(type, typeKey) in logTypes"
                :value="typeKey"
                :key="`${type.label}-${typeKey}`">
                {{ $t(type.label) }}
              </option>
          </select>
        </div>
        <div class="form-item" v-if="!(currentLog.id === undefined)">
          <p> {{ $t(logTypes[currentLog.type].label) }} </p>
        </div>
      </div>


      <div class="form-item form-item-name form-group">
        <label for="notes" class="control-label ">{{ $t('Notes') }}</label>
        <textarea
          :value="parseNotes(currentLog.notes)"
          @input="updateNotes($event.target.value)"
          :placeholder="$t('Enter notes')"
          type="text"
          class="form-control">
        </textarea>
      </div>

      <h3>{{ $t('Log Categories') }}</h3>
      <div id="categories" class="form-item form-group">
        <p v-if="!showAllCategories
          && (!currentLog.log_category
          || currentLog.log_category.length < 1)">
          {{ $t('No categories selected') }}
        </p>
        <farm-select-box
          small
          v-for="cat in filteredCategories"
          :id="`category-${cat.tid}-${cat.name}`"
          :selected="currentLog.log_category
            && currentLog.log_category.some(_cat => cat.tid === _cat.id)"
          :label="cat.name"
          :key="`category-${cat.tid}-${cat.name}`"
          @input="
            $event
            ? addCategory(cat.tid)
            : removeCategory(currentLog
              .log_category.findIndex(_cat => cat.tid === _cat.id))"
          />
        <div class="show-hide">
          <div v-if="!showAllCategories" @click="showAllCategories = !showAllCategories">
            <p><icon-expand-more/>{{ $t('Show More') }}</p>
          </div>
          <div v-if="showAllCategories" @click="showAllCategories = !showAllCategories">
            <p><icon-expand-less/>{{ $t('Show Less') }}</p>
          </div>
        </div>
      </div>

      <div v-if="currentLog.quantity !== undefined">
        <h3>{{ $t('Quantities')}}</h3>
        <label for="quantity" class="control-label ">
          {{ $t('Add new or edit existing quantity')}}
        </label>
        <div v-if="currentQuant >= 0" class="form-item form-item-name form-group">
          <!-- To display a placeholder value ONLY when there are no existing
          quantities, we must add the placeholder with an <option> tag and
          select it using the :value option -->
          <select
            :value="(currentLog.quantity
              && currentLog.quantity.length > 0
              && currentLog.quantity[currentQuant].measure)
              ? currentLog.quantity[currentQuant].measure
              : 'Select measure'"
            @input="updateQuantity('measure', $event.target.value, currentQuant)"
            class="custom-select col-sm-3 ">
              <option>{{ $t('Select measure')}}</option>
              <option
                v-for="(measure, i) in quantMeasures"
                :value="measure"
                :key="`measure-${i}`">
                {{ measure }}
              </option>
          </select>
          <input
            :value="(currentLog.quantity
              && currentLog.quantity.length > 0)
              ? currentLog.quantity[currentQuant].value
              : null"
            @input="updateQuantity('value', $event.target.value, currentQuant)"
            :placeholder="$t('Enter value')"
            type="number"
            class="form-control"/>
          <select
          :value="(currentLog.quantity
              && currentLog.quantity.length > 0
              && currentLog.quantity[currentQuant].unit)
              ? currentLog.quantity[currentQuant].unit.id
              : 'Select unit'"
            @input="updateQuantity('unit', $event.target.value, currentQuant)"
            class="custom-select col-sm-3 ">
              <option>{{ $t('Select unit')}}</option>
              <option
                v-for="(unit, i) in units"
                :value="unit.tid"
                :key="`unit-${i}`">
                {{ (units) ? unit.name : '' }}
              </option>
          </select>
          <input
            :value="(currentLog.quantity
              && currentLog.quantity.length > 0)
              ? currentLog.quantity[currentQuant].label
              : null"
            @input="updateQuantity('label', $event.target.value, currentQuant)"
            :placeholder="$t('Enter label')"
            type="text"
            class="form-control"/>
        </div>

        <div class="form-item form-group">
          <ul
            v-if="currentLog.quantity
              && currentLog.quantity.length > 0"
            class="list-group">
            <li
              v-for="(quant, i) in currentLog.quantity"
              v-bind:key="`quantity-${i}-${Math.floor(Math.random() * 1000000)}`"
              @click="currentQuant = i"
              class="list-group-item">
              {{ quant.measure }}&nbsp;
              {{ quant.value }}&nbsp;
              {{ (quantUnitNames.length > 0) ? quantUnitNames[i] : '' }}&nbsp;
              {{ quant.label }}
              <span class="remove-list-item" @click="removeQuant(i); $event.stopPropagation()">
                &#x2715;
              </span>
            </li>
          </ul>
        </div>

        <div class="form-item form-group">
          <button
            type="button"
            class="btn btn-success"
            @click="updateQuantity(null, null, -1)"
            name="addNewQuantity">
            {{$t('Add another quantity')}}
          </button>
        </div>
      </div>

      <h3>{{ $t('Assets')}}</h3>
      <farm-autocomplete
        :objects="filteredAssets"
        searchKey="name"
        searchId="id"
        :label="assetsRequired()
          ? $t('Seedings must include assets!')
          : $t('Add assets to the log')"
        :class="{ invalid: assetsRequired() }"
        v-on:results="addAsset($event)">
        <template slot="empty">
          <div class="empty-slot">
            <em>{{ $t('No assets found.')}}</em>
            <br>
            <button
              type="button"
              class="btn btn-light"
              @click="forceSync"
              name="button">
              {{ $t('Sync Now')}}
            </button>
          </div>
        </template>
      </farm-autocomplete>

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
        <label for="type" class="control-label ">{{ $t('Equipment')}}</label>
        <div class="input-group">
          <select
            @input="addEquipment($event.target.value)"
            class="custom-select col-sm-3 ">
            <option value=""></option>
            <option
              v-for="(equip, i) in equipment"
              :value="equip.id"
              :key="`equip-${i}`">
              {{ (equip) ? equip.name : '' }}
            </option>
          </select>
        </div>
      </div>
      <div class="form-item form-group">
        <ul v-if="currentLog.equipment" class="list-group">
          <li
            v-for="(equip, i) in currentLog.equipment"
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
        v-if="!(currentLog.type === 'farm_seeding')"
        id="areas-and-location">
        <h3>{{ $t('Areas')}} &amp; {{ $t('Location')}}</h3>

        <!-- We're using a radio button to choose whether areas are selected
        automatically based on device location, or using an autocomplete.
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
            <label class="form-check-label" for="dontUseGeo">{{ $t('Search areas')}}</label>
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
            <label class="form-check-label" for="doUseGeo">{{ $t('Use my location')}}</label>
          </div>
        </div>

        <!-- If using the user's, show a select menu of nearby locations -->
        <div v-if="useLocalAreas" class="form-group">
          <label for="areaSelector">{{ $t('Farm areas near your current location')}}</label>
          <select
            @input="addArea($event.target.value)"
            class="form-control"
            name="areas">
            <option v-if="localAreas.length < 1" value="">No other areas nearby</option>
            <option v-if="localAreas.length > 0" value="" selected>-- Select an Area --</option>
            <option
              v-for="area in localAreas"
              :value="area.tid"
              v-bind:key="`area-${area.tid}`">
              {{area.name}}
            </option>
          </select>
        </div>

        <!-- If not using the user's location, show a search bar -->
        <farm-autocomplete
          v-if="!useLocalAreas"
          :objects="filteredAreas"
          searchKey="name"
          searchId="tid"
          :label="$t('Add areas to the log')"
          v-on:results="addArea($event)">
          <template slot="empty">
            <div class="empty-slot">
              <em>{{ $t('No areas found.')}}</em>
              <br>
              <button
                type="button"
                class="btn btn-light"
                @click="forceSync"
                name="button">
              {{ $t('Sync Now')}}
              </button>
            </div>
          </template>
        </farm-autocomplete>

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
            {{ $t('Add my GPS location to the log')}}
          </button>
        </div>

        <!-- Display a spinner while getting geolocation, then display the location -->
        <div v-if="currentLog.geofield" class="form-item form-item-name form-group">
          <ul class="list-group">
            <li
              class="list-group-item"
              v-for="(point, i) in geofieldAsArrayOfWktPoints"
              :key="`geofield-${i}`">
              {{ point }}
              <span class="remove-list-item" @click="removeLocation(i)">
                &#x2715;
              </span>
            </li>
            <li class="list-item-group" v-if="isWorking">
              <icon-spinner/>
            </li>
          </ul>
        </div>
      </div>

      <h3>{{ $t('Images')}}</h3>

      <div
        v-if="isNative"
        class="form-item form-item-name form-group">
        <button
          :disabled='false'
          title="Take picture with camera"
          @click="getPhoto"
          class="btn btn-info btn-navbar navbar-right"
          type="button">
          {{ $t('Take picture with camera')}}
        </button>
      </div>

      <div class="form-item form-item-name form-group">
        <div class="input-group ">
          <label
            class="custom-file-label"
            for="customFile">
            {{ $t('Select photo from file')}}
          </label>
          <input
            type="file"
            accept="image/*"
            class="custom-file-input"
            ref="photo"
            @change="loadPhoto($event.target.files)">
        </div>
      </div>
      <div class="form-item form-item-name form-group">
        <!-- NOTE: Display is set to 'none' if the img fails to load. -->
        <img
          v-for="(url, i) in imageUrls"
          :src="url"
          :key="`preview-${i}`"
          onerror="this.style.display='none'"
          class="preview" />
      </div>

    </div>
  </template>

  <template #movement>

    <div
      class="container-fluid"
      v-if="currentLog.movement !== undefined">

      <br>
      <farm-autocomplete
        :objects="filteredAssets"
        searchKey="name"
        searchId="id"
        :label="assetsRequired()
          ? $t('Seedings must include assets!')
          : $t('Add assets to be moved')"
        :class="{ invalid: assetsRequired() }"
        v-on:results="addAsset($event)">
        <template slot="empty">
          <div class="empty-slot">
            <em>{{ $t('No assets found.')}}</em>
            <br>
            <button
              type="button"
              class="btn btn-light"
              @click="forceSync"
              name="button">
              {{ $t('Sync Now')}}
            </button>
          </div>
        </template>
      </farm-autocomplete>

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

      <farm-autocomplete
        :objects="filteredMovementAreas"
        searchKey="name"
        searchId="tid"
        :label="$t('Movement to')"
        v-on:results="addMovementArea($event)">
        <template slot="empty">
          <div class="empty-slot">
            <em>{{ $t('No areas found.')}}</em>
            <br>
            <button
              type="button"
              class="btn btn-light"
              @click="forceSync"
              name="button">
              {{ $t('Sync Now')}}
            </button>
          </div>
        </template>
      </farm-autocomplete>

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

      <router-link :to="{ name: 'tasks-map' }">
        <farm-map
          id="map"
          :overrideStyles="{ height: '90vw' }"
          :drawing="false"
          :options="{
            controls: (defaults) =>
              defaults.filter(def => def.constructor.name === 'Attribution'),
            interactions: false,
          }"
          :wkt=mapLayers
          :geojson="{
            title: 'areas',
            geojson: areaGeoJSON,
            color: 'grey',
          }"/>
      </router-link>

      <br>

    </div>
  </template>

</farm-tabs>
</template>

<script>
const {
  parseNotes,
  mergeGeometries,
  removeGeometry,
  isNearby,
} = window.farmOS.utils;
const { parse } = window.farmOS.lib.wellknown;

export default {
  name: 'TasksEdit',

  data() {
    return {
      useLocalAreas: false,
      isWorking: false,
      localAreas: [],
      showAllCategories: false,
      currentQuant: -1,
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
    'logTypes',
    'areas',
    'assets',
    'useGeolocation',
    'units',
    'categories',
    'equipment',
    'areaGeoJSON',
  ],

  methods: {
    forceSync() {
      if (localStorage.getItem('host') !== null) {
        this.$store.dispatch('updateAssets');
        this.$store.dispatch('updateAreas');
        return;
      }
      this.$router.push('/login');
    },

    updateCurrentLog(key, val) {
      const props = {
        [key]: val,
        localID: +this.id,
      };
      this.updateLog(props);
    },

    updateNotes(value) {
      this.updateCurrentLog('notes', { value, format: 'farm_format' });
    },
    updateQuantity(key, value, index) {
      const currentQuants = this.currentLog.quantity || [];
      const storedVal = (key === 'unit')
        ? { id: value, resource: 'taxonomy_term' }
        : value;
      let updatedQuant; let updatedQuants;
      if (index >= 0) {
        updatedQuant = { ...currentQuants[index], [key]: storedVal };
        updatedQuants = [
          ...currentQuants.slice(0, index),
          updatedQuant,
          ...currentQuants.slice(index + 1),
        ];
      } else {
        updatedQuant = {
          measure: null,
          value: null,
          unit: null,
          label: null,
        };
        updatedQuants = [...currentQuants, updatedQuant];
      }
      this.updateCurrentLog('quantity', updatedQuants);
      if (index < 0) {
        this.currentQuant = updatedQuants.length - 1;
      }
    },

    addCategory(id) {
      const catReference = { id, resource: 'taxonomy_term' };
      const oldCats = this.currentLog.log_category;
      const newCats = oldCats
        ? oldCats.concat(catReference)
        : [catReference];
      this.updateCurrentLog('log_category', newCats);
    },

    addEquipment(id) {
      if (id !== '') {
        const equipReference = { id, resource: 'farm_asset' };
        const oldEquip = this.currentLog.equipment;
        const newEquip = oldEquip
          ? oldEquip.concat(equipReference)
          : [equipReference];
        this.updateCurrentLog('equipment', newEquip);
      }
    },

    addAsset(id) {
      const assetReference = { id, resource: 'farm_asset' };
      const newAssets = this.currentLog.asset.concat(assetReference);
      this.updateCurrentLog('asset', newAssets);
    },

    addMovementArea(id) {
      const areaReference = { id, resource: 'taxonomy_term' };
      const areaGeometry = (this.areas.find(area => area.tid === id).geofield[0])
        ? this.areas.find(area => area.tid === id).geofield[0].geom
        : null;
      const prevMovement = this.currentLog.movement;
      const newGeometry = prevMovement
        ? mergeGeometries([areaGeometry, prevMovement.geometry])
        : areaGeometry;
      const newMovement = {
        area: prevMovement
          ? prevMovement.area.concat(areaReference)
          : [areaReference],
        geometry: newGeometry,
      };
      this.updateCurrentLog('movement', newMovement);
    },

    addArea(id) {
      if (id !== '') {
        const areaReference = { id, resource: 'taxonomy_term' };
        const newAreas = this.currentLog.area.concat(areaReference);
        this.updateCurrentLog('area', newAreas);
      }
    },

    removeAsset(asset) {
      const newAssets = this.currentLog.asset
        .filter(_asset => _asset.id !== asset.id);
      this.updateCurrentLog('asset', newAssets);
    },

    removeArea(area) {
      // Update the current log with a new array of areas, sans the removed one.
      const newAreas = this.currentLog.area
        .filter(_area => _area.id !== area.tid);
      this.updateCurrentLog('area', newAreas);

      // Also remove the area's geofield from the current log.
      const removedGeofields = this.areas
        .find(_area => _area.tid === area.tid)
        ?.geofield;
      const newGeofields = this.currentLog.geofield
        ?.filter(geofield => !removedGeofields.some(_geofield => geofield.geom === _geofield.geom));
      this.updateCurrentLog('geofield', newGeofields);
    },

    removeMovementArea(area) {
      const newAreas = this.currentLog.movement.area
        .filter(_area => _area.id !== area.tid);
      const prevGeometry = this.currentLog.movement.geometry;
      let areaGeometry = null;
      if (area.geofield[0]) {
        areaGeometry = area.geofield[0].geom;
      }
      const newGeometry = removeGeometry(prevGeometry, areaGeometry);
      const newMovement = {
        geometry: newGeometry,
        area: newAreas,
      };
      this.updateCurrentLog('movement', newMovement);
    },

    removeQuant(index) {
      if (this.currentQuant >= index) {
        this.currentQuant -= 1;
      }
      const newQuant = [
        ...this.currentLog.quantity.slice(0, index),
        ...this.currentLog.quantity.slice(index + 1),
      ];
      this.updateCurrentLog('quantity', newQuant);
    },

    removeCategory(index) {
      const newCat = this.currentLog.log_category;
      newCat.splice(index, 1);
      this.updateCurrentLog('category', newCat);
    },

    removeEquipment(index) {
      const newEquip = this.currentLog.equipment;
      newEquip.splice(index, 1);
      this.updateCurrentLog('equipment', newEquip);
    },

    getPhoto() {
      // Obtains an image location from the camera!
      return this.$store.dispatch('getPhotoFromCamera', this.currentLog);
    },

    loadPhoto(files) {
      for (let i = 0; i < files.length; i += 1) {
        this.$store.dispatch('loadPhotoBlob', {
          file: files[i],
          log: this.currentLog,
        });
      }
    },

    addLocation() {
      let props;
      function addGeofield(position) {
        const oldGeom = this.currentLog.geofield?.[0]?.geom;
        const newGeom = `POINT (${position.coords.longitude} ${position.coords.latitude})`;
        props = [{ geom: mergeGeometries([oldGeom, newGeom]) }];
      }
      function onError({ message }) {
        const errorPayload = { message, level: 'warning', show: false };
        this.$store.commit('logError', errorPayload);
        this.isWorking = false;
      }
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      this.isWorking = true;
      const watch = navigator.geolocation.watchPosition(
        addGeofield.bind(this),
        onError.bind(this),
        options,
      );
      setTimeout(() => {
        navigator.geolocation.clearWatch(watch);
        this.updateCurrentLog('geofield', props);
        this.isWorking = false;
      }, 5000);
    },

    removeLocation(index) {
      const geofield = [{
        geom: mergeGeometries([
          ...this.geofieldAsArrayOfWktPoints.slice(0, index),
          ...this.geofieldAsArrayOfWktPoints.slice(index + 1),
        ]),
      }];
      this.updateCurrentLog('geofield', geofield);
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
      return this.currentLog.type === 'farm_seeding' && this.selectedAssets < 1;
    },
    parseNotes,
  },

  computed: {
    currentLog() {
      return this.logs.find(log => log.localID === +this.id) || this.logs[0];
    },
    /*
      In order to avoid duplicates, filteredAssets & filteredAreas remove
      assets/areas from the array of searchable objects if they've already been
      added to the current log.
    */
    filteredAssets() {
      if (this.currentLog.asset) {
        const selectAssetRefs = this.currentLog.asset;
        return this.assets.filter(asset => (
          !selectAssetRefs.some(selAsset => asset.id === selAsset.id)
        ));
      }
      return this.assets;
    },
    filteredAreas() {
      if (this.currentLog.area) {
        const selectAreaRefs = this.currentLog.area;
        return this.areas.filter(area => (
          !selectAreaRefs.some(selArea => area.tid === selArea.id)
        ));
      }
      return this.areas;
    },
    filteredMovementAreas() {
      const { movement } = this.currentLog;
      if (movement && movement && movement.area) {
        const selectAreaRefs = this.currentLog.movement.area;
        return this.areas.filter(area => (
          !selectAreaRefs.some(selArea => area.tid === selArea.id)
        ));
      }
      return this.areas;
    },
    filteredCategories() {
      const selectedCats = this.currentLog.log_category;
      const noCatsAreSelected = !selectedCats || selectedCats.length === 0;
      if (!this.showAllCategories && !noCatsAreSelected) {
        return this.categories.filter(cat => (
          selectedCats.some(_cat => cat.tid === _cat.id)
        ));
      }
      if (this.showAllCategories) {
        return this.categories;
      }
      return [];
    },
    geofieldAsArrayOfWktPoints() {
      const geom = this.currentLog.geofield?.[0]?.geom;
      if (geom) {
        const geojson = parse(geom);
        if (geojson.type === 'Point') {
          return [`POINT (${geojson.coordinates[0]} ${geojson.coordinates[1]})`];
        }
        if (geojson.type === 'GeometryCollection') {
          return geojson.geometries
            .map(g => `POINT (${g.coordinates[0]} ${g.coordinates[1]})`);
        }
      }
      return [];
    },
    selectedAssets() {
      if (this.currentLog.asset) {
        return this.getAttached(this.currentLog.asset, this.assets, 'id');
      }
      return [];
    },
    selectedAreas() {
      if (this.currentLog.area) {
        return this.getAttached(this.currentLog.area, this.areas, 'tid');
      }
      return [];
    },
    selectedMovementAreas() {
      const { movement } = this.currentLog;
      if (movement && movement.area) {
        return this.getAttached(
          this.currentLog.movement.area,
          this.areas,
          'tid',
        );
      }
      return [];
    },
    quantUnitNames() {
      if (this.units.length > 0 && this.currentLog?.quantity.length > 0) {
        const unitNames = [];
        this.currentLog.quantity.forEach((quant) => {
          if (quant.unit) {
            this.units.forEach((unit) => {
              if (parseInt(unit.tid, 10) === parseInt(quant.unit.id, 10)) {
                unitNames.push(unit.name);
              }
            });
          } else {
            unitNames.push(null);
          }
        });
        return unitNames;
      }
      return [];
    },
    categoryNames() {
      if (this.categories.length > 0
        && this.currentLog.log_category.length > 0) {
        const catNames = [];
        this.currentLog.log_category.forEach((logCat) => {
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
      if (this.equipment.length > 0
        && this.currentLog.equipment
        && this.currentLog.equipment.length > 0) {
        const equipNames = [];
        this.currentLog.equipment.forEach((logEquip) => {
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
    isNative() {
      if (process.env.PLATFORM === 'native' || process.env.PLATFORM === 'dev') {
        return true;
      }
      return false;
    },
    imageUrls() {
      return this.currentLog.images
        .filter(img => typeof img === 'string');
    },
    /*
    Assemble layers for display.
    The 'previous' layer is assembled from the geofield plus
    all area geometires associated with the log.
    The 'movement' layer is the geometry in the log's movement field
    */
    mapLayers() {
      const movement = {
        title: 'movement',
        wkt: this.currentLog.movement?.geometry,
        color: 'orange',
        visible: true,
        weight: 0,
        canEdit: !!this.currentLog.movement?.geometry,
      };
      const previousGeoms = this.currentLog.asset
        ?.map(logAsset => this.assets
          ?.find(asset => asset.id === logAsset.id)?.geometry);
      const previousWKT = previousGeoms ? mergeGeometries(previousGeoms) : undefined;
      const previous = {
        title: 'previous',
        wkt: previousWKT,
        color: 'green',
        visible: true,
        weight: 1,
        canEdit: false,
      };
      return [previous, movement];
    },
  },

  watch: {
    useLocalAreas() {
      function filterAreasByProximity(position) {
        this.localAreas = this.filteredAreas.filter(area => !!area.geofield[0] && isNearby(
          [position.coords.longitude, position.coords.latitude],
          area.geofield[0].geom,
          (position.coords.accuracy),
        ));
      }
      function onError({ message }) {
        const errorPayload = { message, level: 'warning', show: false };
        this.$store.commit('logError', errorPayload);
      }
      // If useLocalAreas is set to true, get geolocation and nearby areas
      if (this.useLocalAreas) {
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        };

        const watch = navigator.geolocation.watchPosition(
          filterAreasByProximity.bind(this),
          onError.bind(this),
          options,
        );
        setTimeout(() => {
          navigator.geolocation.clearWatch(watch);
        }, 5000);
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
    color: var(--light);
  }

  .empty-slot button {
    margin: 0.5rem;
    color: var(--light);
  }

  .remove-list-item {
    float: right;
    cursor: pointer;
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
