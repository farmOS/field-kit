<template>
<farm-tabs
  :tabs="['General', 'Movement']"
  :initTab="$router.currentRoute.params.tab"
  :space="['none', 'none', 's']">

  <template #general>
    <farm-stack :space="['none', 'none', 's']" :dividers="true">

      <farm-card>
        <div class="form-item form-group">
          <farm-toggle-check
            :label="$t('Done')"
            labelPosition="after"
            :checked="log.status === 'done'"
            @input="updateCurrentLog('status', $event ? 'done' : 'pending')"/>
        </div>
        <div class="form-item form-item-name form-group">
          <label for="name" class="control-label">{{ $t('Name') }}</label>
          <input
            :value="log.name"
            @input="updateCurrentLog('name', $event.target.value)"
            :placeholder="$t('Enter name')"
            type="text"
            class="form-control"
            maxlength="250"
            autofocus>
        </div>
        <farm-date-time-form
          :timestamp="log.timestamp"
          @input="updateCurrentLog('timestamp', $event)"/>
        <!-- Allow users to change type for logs that have not yet been sent to the server
        For logs currently on the server, display type as text -->
        <div class="form-item form-item-name form-group">
          <label for="type" class="control-label ">{{ $t('Log Type') }}</label>
          <div class="input-group" v-if="(log.id === undefined)">
            <select
              :value="log.type"
              @input="updateCurrentLog('type', $event.target.value)"
              class="custom-select col-sm-3 ">
                <option
                  v-for="(type, typeKey) in logTypes"
                  :value="typeKey"
                  :key="`${type.label}-${typeKey}`">
                  {{ $t(type.label) }}
                </option>
            </select>
          </div>
          <div class="form-item" v-if="!(log.id === undefined)">
            <p> {{ $t(logTypes[log.type].label) }} </p>
          </div>
        </div>
      </farm-card>

      <farm-card>
        <div class="form-item form-item-name form-group">
          <label for="notes" class="control-label ">{{ $t('Notes') }}</label>
          <textarea
            :value="parseNotes(log.notes)"
            @input="updateNotes($event.target.value)"
            :placeholder="$t('Enter notes')"
            type="text"
            rows="4"
            class="form-control">
          </textarea>
        </div>
      </farm-card>

      <farm-card>
        <h3>{{ $t('Log Categories') }}</h3>
        <div v-if="showAllCategories" id="categories" class="form-item form-group">
          <farm-select-box
            small
            v-for="cat in allCategories"
            :id="`category-${cat.id}-${cat.name}`"
            :selected="log.category.some(c => c.id === cat.id)"
            :label="cat.name"
            :key="`category-${cat.id}-${cat.name}`"
            @input="toggleCategory($event, cat.id)">
          </farm-select-box>
          <div class="show-hide">
            <div @click="showAllCategories = !showAllCategories">
              <p><icon-expand-less/>{{ $t('Show Less') }}</p>
            </div>
          </div>
        </div>
        <div v-else id="categories" class="form-item form-group">
          <p v-if="!log.category || log.category.length < 1">
            {{ $t('No categories selected') }}
          </p>
          <farm-select-box
            small
            v-for="cat in categories.selected"
            :id="`category-${cat.id}-${cat.name}`"
            :selected="true"
            :label="cat.name"
            :key="`category-${cat.id}-${cat.name}`"
            @input="toggleCategory($event, cat.id)">
          </farm-select-box>
          <div class="show-hide">
            <div @click="showAllCategories = !showAllCategories">
              <p><icon-expand-more/>{{ $t('Show More') }}</p>
            </div>
          </div>
        </div>
      </farm-card>

      <farm-card v-if="log.quantity !== undefined">
        <h3>{{ $t('Quantities')}} 🚧 UNDER CONSTRUCTION 🚧</h3>
        <!-- <label for="quantity" class="control-label ">
          {{ $t('Add new or edit existing quantity')}}
        </label>
        <div v-if="currentQuant >= 0" class="form-item form-item-name form-group"> -->
          <!-- To display a placeholder value ONLY when there are no existing
          quantities, we must add the placeholder with an <option> tag and
          select it using the :value option -->
          <!-- <select
            :value="(log.quantity
              && log.quantity.length > 0
              && log.quantity[currentQuant].measure)
              ? log.quantity[currentQuant].measure
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
            :value="(log.quantity
              && log.quantity.length > 0)
              ? log.quantity[currentQuant].value
              : null"
            @input="updateQuantity('value', $event.target.value, currentQuant)"
            :placeholder="$t('Enter value')"
            type="number"
            class="form-control"/>
          <select
          :value="(log.quantity
              && log.quantity.length > 0
              && log.quantity[currentQuant].unit)
              ? log.quantity[currentQuant].unit.id
              : 'Select unit'"
            @input="updateQuantity('unit', $event.target.value, currentQuant)"
            class="custom-select col-sm-3 ">
              <option>{{ $t('Select unit')}}</option>
              <option
                v-for="(unit, i) in units"
                :value="unit.id"
                :key="`unit-${i}`">
                {{ (units) ? unit.name : '' }}
              </option>
          </select>
          <input
            :value="(log.quantity
              && log.quantity.length > 0)
              ? log.quantity[currentQuant].label
              : null"
            @input="updateQuantity('label', $event.target.value, currentQuant)"
            :placeholder="$t('Enter label')"
            type="text"
            class="form-control"/>
        </div>
        <div class="form-item form-group">
          <ul
            v-if="log.quantity
              && log.quantity.length > 0"
            class="list-group">
            <li
              v-for="(quant, i) in log.quantity"
              v-bind:key="`quantity-${i}`"
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
        </div> -->
      </farm-card>

      <farm-card>
        <h3>{{ $t('Assets')}}</h3>
        <farm-autocomplete
          :list="assets.unselected"
          :keys="['name']"
          @select="toggleAsset(true, assets.unselected[$event])"
          :label="$t('Add assets to the log')">
          <template slot="empty">
            <div class="empty-slot">
              <em>{{ $t('No assets found.')}}</em>
            </div>
          </template>
        </farm-autocomplete>
        <div class="form-item form-item-name form-group">
          <ul class="list-group">
            <li
              v-for="asset in assets.selected"
              :key="`asset-${asset.id}`"
              class="list-group-item">
              {{ asset.name }}
              <span class="remove-list-item" @click="toggleAsset(false, asset)">
                &#x2715;
              </span>
            </li>
          </ul>
        </div>
        <div v-if="log.equipment" class="form-item form-item-name form-group">
          <label for="type" class="control-label ">{{ $t('Equipment') }}</label>
          <div class="input-group">
            <select
              @input="toggleEquipment(true, $event.target.value)"
              class="custom-select col-sm-3 ">
              <option value=""></option>
              <option
                v-for="(equip, i) in equipment.unselected"
                :value="equip.id"
                :key="`equip-${i}`">
                {{ (equip) ? equip.name : '' }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-item form-group">
          <ul v-if="log.equipment" class="list-group">
            <li
              v-for="(equip, i) in equipment.selected"
              v-bind:key="`equipment-${i}`"
              class="list-group-item">
              {{ equip.name }}
              <span class="remove-list-item" @click="toggleEqupment(false, equip.id)">
                &#x2715;
              </span>
            </li>
          </ul>
        </div>
      </farm-card>

      <farm-card>
        <h3>{{ $t('Areas')}} &amp; {{ $t('Location')}}</h3>
        <!-- We're using a radio button to choose whether areas are selected
        automatically based on device location, or using an autocomplete.
        This will use the useLocalAreas conditional var -->
        <!-- <div  v-if="useGeolocation" class="form-item form-item-name form-group">
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
        </div> -->
        <!-- If using the user's, show a select menu of nearby locations -->
        <div v-if="useLocalAreas" class="form-group">
          <label for="areaSelector">{{ $t('Farm areas near your current location')}}</label>
          <select
            @input="toggleArea(true, localAreas[$event.target.value])"
            class="form-control"
            name="areas">
            <option v-if="localAreas.length < 1" value="">No other areas nearby</option>
            <option v-if="localAreas.length > 0" value="" selected>-- Select an Area --</option>
            <option
              v-for="(area, i) in localAreas"
              :value="i"
              :key="`local-area-${area.id}`">
              {{area.name}}
            </option>
          </select>
        </div>
        <!-- If not using the user's location, show a search bar -->
        <farm-autocomplete
          v-if="!useLocalAreas"
          :list="areas.unselected"
          :keys="['name']"
          @select="toggleArea(true, areas.unselected[$event])"
          :label="$t('Add areas to the log')">
          <template slot="empty">
            <div class="empty-slot">
              <em>{{ $t('No areas found.')}}</em>
            </div>
          </template>
        </farm-autocomplete>
        <div class="form-item form-item-name form-group">
          <ul class="list-group">
            <li
              v-for="area in areas.selected"
              v-bind:key="`remove-area-${area.id}`"
              class="list-group-item">
              {{ area.name }}
              <span class="remove-list-item" @click="toggleArea(false, area)">
                &#x2715;
              </span>
            </li>
          </ul>
        </div>
        <div v-if="useGeolocation" class="form-item form-item-name form-group">
          <button
            :disabled='false'
            title="Add my GPS location to the log"
            @click="addGeolocationPoint"
            type="button"
            class="btn btn-success btn-navbar">
            {{ $t('Add my GPS location to the log')}}
          </button>
        </div>
        <div v-if="log.geometry" class="form-item form-item-name form-group">
          <ul class="list-group">
            <li
              class="list-group-item"
              v-for="(point, i) in geometryAsArrayOfWktPoints"
              :key="`geometry-${i}`">
              {{ point }}
              <span class="remove-list-item" @click="removeGeolocationPoint(i)">
                &#x2715;
              </span>
            </li>
            <li class="list-item-group" v-if="awaitingLocation">
              <icon-spinner/>
            </li>
          </ul>
        </div>
      </farm-card>

      <farm-card>
        <h3>{{ $t('Images')}} 🚧 UNDER CONSTRUCTION 🚧</h3>
        <!-- <div
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
        </div> -->
        <!-- NOTE: Display is set to 'none' if the img fails to load. -->
        <!-- <div class="form-item form-item-name form-group">
          <img
            v-for="(url, i) in imageUrls"
            :src="url"
            :key="`preview-${i}`"
            onerror="this.style.display='none'"
            class="preview" />
        </div> -->
      </farm-card>

    </farm-stack>
  </template>

  <template #movement>

    <farm-card><h3>🚧 UNDER CONSTRUCTION 🚧</h3></farm-card>
    <!-- <farm-card v-if="log.movement !== undefined">

      <farm-autocomplete
        :list="assets.unselected"
        :keys="['name']"
        @select="toggleAsset(true, assets.unselected[$event])"
        :label="$t('Add assets to be moved')">
        <template slot="empty">
          <div class="empty-slot">
            <em>{{ $t('No assets found.')}}</em>
          </div>
        </template>
      </farm-autocomplete>

      <div class="form-item form-item-name form-group">
        <ul class="list-group">
          <li
            v-for="asset in assets.selected"
            :key="`asset-movement-${asset.id}`"
            class="list-group-item">
            {{ asset.name }}
            <span class="remove-list-item" @click="toggleAsset(false, asset)">
              &#x2715;
            </span>
          </li>
        </ul>
      </div>

      <farm-autocomplete
        :list="areas.unselected"
        :keys="['name']"
        @select="addMovementArea(areas.unselected[$event])"
        :label="$t('Movement to')">
        <template slot="empty">
          <div class="empty-slot">
            <em>{{ $t('No areas found.')}}</em>
          </div>
        </template>
      </farm-autocomplete>

      <div class="form-item form-item-name form-group">
        <ul class="list-group">
          <li
            v-for="(area, i) in areas.selected"
            v-bind:key="`remove-movement-${i}`"
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

    </farm-card> -->
  </template>

</farm-tabs>
</template>

<script>
const {
  parseNotes,
  mergeGeometries,
  // removeGeometry,
  // isNearby,
} = window.farmOS.utils;
const { R, wellknown } = window.farmOS.lib;

// Used to separate assets, areas, etc into those that have already been added
// to the log (selected), and those that haven't (unselected).
const partitionOptions = (options = [], selections = []) => {
  const [selected, unselected] = R.partition(
    opt => selections.some(sel => sel.id === opt.id),
    options,
  );
  return { selected, unselected };
};

export default {
  name: 'TasksEdit',

  data() {
    return {
      useLocalAreas: false,
      awaitingLocation: false,
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
    'logTypes',
    'useGeolocation',
    'allAssets',
    'allCategories',
    'allEquipment',
    'allAreas',
    'allLogs',
    'allUnits',
    'areaGeoJSON',
  ],

  methods: {
    updateCurrentLog(key, val) {
      const props = {
        [key]: val,
        id: this.id,
      };
      this.updateLog(props);
    },

    updateNotes(value) {
      this.updateCurrentLog('notes', { value, format: 'default' });
    },

    // updateQuantity(key, value, index) {
    //   const currentQuants = this.log.quantity || [];
    //   const storedVal = (key === 'unit')
    //     ? { id: value, type: 'taxonomy_term--unit' }
    //     : value;
    //   let updatedQuant; let updatedQuants;
    //   if (index >= 0) {
    //     updatedQuant = { ...currentQuants[index], [key]: storedVal };
    //     updatedQuants = [
    //       ...currentQuants.slice(0, index),
    //       updatedQuant,
    //       ...currentQuants.slice(index + 1),
    //     ];
    //   } else {
    //     updatedQuant = {
    //       measure: null,
    //       value: null,
    //       unit: null,
    //       label: null,
    //     };
    //     updatedQuants = [...currentQuants, updatedQuant];
    //   }
    //   this.updateCurrentLog('quantity', updatedQuants);
    //   if (index < 0) {
    //     this.currentQuant = updatedQuants.length - 1;
    //   }
    // },

    toggleAsset(isSelected, { id, type }) {
      const newAssets = isSelected
        ? this.log.asset.concat({ id, type })
        : this.log.asset.filter(c => c.id !== id);
      this.updateCurrentLog('asset', newAssets);
    },
    toggleArea(isSelected, { id, type }) {
      const newAreas = isSelected
        ? this.log.location.concat({ id, type })
        : this.log.location.filter(c => c.id !== id);
      this.updateCurrentLog('location', newAreas);
    },
    toggleCategory(isSelected, id) {
      const newCats = isSelected
        ? this.log.category.concat({ id, type: 'taxonomy_term--log_category' })
        : this.log.category.filter(c => c.id !== id);
      this.updateCurrentLog('category', newCats);
    },
    toggleEquipment(isSelected, id) {
      return isSelected
        ? this.log.equipment.concat({ id, type: 'asset--equipment' })
        : this.log.equipment.filter(c => c.id !== id);
    },

    // addMovementArea(area) {
    //   const { id, type } = area;
    //   const areaReference = { id, type: `asset--${type}` };
    //   // TODO: replace geofield property
    //   const areaGeometry = area.geofield[0]?.geom;
    //   const prevMovement = this.log.movement;
    //   const newGeometry = prevMovement
    //     ? mergeGeometries([areaGeometry, prevMovement.geometry])
    //     : areaGeometry;
    //   const newMovement = {
    //     area: prevMovement
    //       ? prevMovement.area.concat(areaReference)
    //       : [areaReference],
    //     geometry: newGeometry,
    //   };
    //   this.updateCurrentLog('movement', newMovement);
    // },

    // removeMovementArea(area) {
    //   const newAreas = this.log.movement.area
    //     .filter(_area => _area.id !== area.id);
    //   const prevGeometry = this.log.movement.geometry;
    //   let areaGeometry = null;
    //   // TODO: Replace geofield property.
    //   if (area.geofield[0]) {
    //     areaGeometry = area.geofield[0].geom;
    //   }
    //   const newGeometry = removeGeometry(prevGeometry, areaGeometry);
    //   const newMovement = {
    //     geometry: newGeometry,
    //     area: newAreas,
    //   };
    //   this.updateCurrentLog('movement', newMovement);
    // },

    // removeQuant(index) {
    //   if (this.currentQuant >= index) {
    //     this.currentQuant -= 1;
    //   }
    //   const newQuant = [
    //     ...this.log.quantity.slice(0, index),
    //     ...this.log.quantity.slice(index + 1),
    //   ];
    //   this.updateCurrentLog('quantity', newQuant);
    // },

    // getPhoto() {
    //   // Obtains an image location from the camera!
    //   return this.$store.dispatch('getPhotoFromCamera', this.log);
    // },

    // loadPhoto(files) {
    //   for (let i = 0; i < files.length; i += 1) {
    //     this.$store.dispatch('loadPhotoBlob', {
    //       file: files[i],
    //       log: this.log,
    //     });
    //   }
    // },

    addGeolocationPoint() {
      let props;
      function addGeometry(position) {
        const oldGeom = this.log.geometry?.value;
        const newGeom = `POINT (${position.coords.longitude} ${position.coords.latitude})`;
        props = { value: mergeGeometries([oldGeom, newGeom]) };
      }
      function onError(error) {
        this.$store.commit('alert', error);
        this.awaitingLocation = false;
      }
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      this.awaitingLocation = true;
      const watch = navigator.geolocation.watchPosition(
        addGeometry.bind(this),
        onError.bind(this),
        options,
      );
      setTimeout(() => {
        navigator.geolocation.clearWatch(watch);
        this.updateCurrentLog('geometry', props);
        this.awaitingLocation = false;
      }, 5000);
    },

    removeGeolocationPoint(index) {
      const geometry = {
        value: mergeGeometries([
          ...this.geometryAsArrayOfWktPoints.slice(0, index),
          ...this.geometryAsArrayOfWktPoints.slice(index + 1),
        ]),
      };
      this.updateCurrentLog('geometry', geometry);
    },

    parseNotes,
  },

  computed: {
    log() {
      return this.allLogs.find(l => l.id === this.id) || {};
    },
    assets() {
      return partitionOptions(this.allAssets, this.log.asset);
    },
    areas() {
      return partitionOptions(this.allAreas, this.log.area);
    },
    categories() {
      return partitionOptions(this.allCategories, this.log.category);
    },
    equipment() {
      if (!this.log.equipment) return { selected: [], unselected: this.allEquipment };
      return partitionOptions(this.allEquipment, this.log.equipment);
    },
    geometryAsArrayOfWktPoints() {
      const geom = this.log.geometry?.value;
      if (geom) {
        const geojson = wellknown.parse(geom);
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

    // quantUnitNames() {
    //   if (this.units.length > 0 && this.log?.quantity.length > 0) {
    //     const unitNames = [];
    //     this.log.quantity.forEach((quant) => {
    //       if (quant.unit) {
    //         this.units.forEach((unit) => {
    //           if (parseInt(unit.id, 10) === parseInt(quant.unit.id, 10)) {
    //             unitNames.push(unit.name);
    //           }
    //         });
    //       } else {
    //         unitNames.push(null);
    //       }
    //     });
    //     return unitNames;
    //   }
    //   return [];
    // },
    // imageUrls() {
    //   return this.log.images
    //     .filter(img => typeof img === 'string');
    // },
    /*
    Assemble layers for display.
    The 'previous' layer is assembled from the geofield plus
    all area geometires associated with the log.
    The 'movement' layer is the geometry in the log's movement field
    */
    // mapLayers() {
    //   const movement = {
    //     title: 'movement',
    //     wkt: this.log.movement?.geometry,
    //     color: 'orange',
    //     visible: true,
    //     weight: 0,
    //     canEdit: !!this.log.movement?.geometry,
    //   };
    //   const previousGeoms = this.log.asset
    //     ?.map(logAsset => this.assets
    //       ?.find(asset => asset.id === logAsset.id)?.geometry);
    //   const previousWKT = previousGeoms ? mergeGeometries(previousGeoms) : undefined;
    //   const previous = {
    //     title: 'previous',
    //     wkt: previousWKT,
    //     color: 'green',
    //     visible: true,
    //     weight: 1,
    //     canEdit: false,
    //   };
    //   return [previous, movement];
    // },
  },

  watch: {
    // useLocalAreas() {
    //   function filterAreasByProximity(position) {
    //     this.localAreas = this.area.unselected.filter(area => !!area.geofield[0] && isNearby(
    //       [position.coords.longitude, position.coords.latitude],
    //       area.geofield[0].geom,
    //       (position.coords.accuracy),
    //     ));
    //   }
    //   function onError(error) {
    //     this.$store.commit('alert', error);
    //   }
    //   // If useLocalAreas is set to true, get geolocation and nearby areas
    //   if (this.useLocalAreas) {
    //     const options = {
    //       enableHighAccuracy: true,
    //       timeout: 10000,
    //       maximumAge: 0,
    //     };

    //     const watch = navigator.geolocation.watchPosition(
    //       filterAreasByProximity.bind(this),
    //       onError.bind(this),
    //       options,
    //     );
    //     setTimeout(() => {
    //       navigator.geolocation.clearWatch(watch);
    //     }, 5000);
    //   }
    // },
  },
};

</script>

<style scoped>
  textarea {
    resize: vertical;
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
