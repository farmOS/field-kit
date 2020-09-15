<template lang="html">
  <div>
    <router-view
      name="menubar"
      @toggle-drawer="$emit('toggle-drawer')"
      @delete-current-log="openDeleteDialog($event)"
      @sync-all="syncAll"
      @sync="sync($event)"
      @reset-display-filters="resetDisplayFilters"
      :logs='logs'
      :isSyncing="isSyncing"
    />
    <router-view
      @add-to-excluded-types="addToExcludedTypes($event)"
      @remove-from-excluded-types="removeFromExcludedTypes($event)"
      @add-to-excluded-categories="addToExcludedCategories($event)"
      @remove-from-excluded-categories="removeFromExcludedCategories($event)"
      @set-date-filter="setDateFilter($event)"
      :logTypes='logTypes'
      :logs='sortLogsDescending(logs)'
      :areas='areas'
      :assets='assets'
      :useGeolocation='useGeolocation'
      :units='units'
      :categories='categories'
      :equipment='equipment'
      :userId='userId'
      :logDisplayFilters='logDisplayFilters'
      :systemOfMeasurement='systemOfMeasurement'
      :areaGeoJSON='areaGeoJSON'
    />

    <div
      v-if="showDeleteDialog"
      class="modal"
      id="delete-dialog"
      tabindex="-1"
      role="dialog">
      <div class="modal-filter"></div>
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">{{ $t('Confirm Deletion')}}</h5>
            <button
              type="button"
              class="close"
              @click='cancelDelete'
              aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            {{ $t('Are sure you\'d like to delete the log')}} "{{logToDelete.name}}"?&nbsp;
            <span
              v-if='isUnsynced(logToDelete)'>
              {{ $t('Deleting it on this device will not remove the log from the server.') }}
            </span>
            <span v-else>
              <!-- eslint-disable-next-line max-len -->
              {{ $t('It has not yet been synced to the server and cannot be recovered after it\'s deleted.')}}
            </span>
          </div>
          <div class="modal-footer">
            <button
            type="button"
            class="btn btn-secondary"
            @click='cancelDelete'>
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click='confirmDelete()'>
            Delete
          </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sort from 'ramda/src/sort';

const { isUnsynced } = window.farmOS.utils.farmLog;

export default {
  name: 'Tasks',
  data() {
    return {
      filter: {
      },
      pass: {
        localIDs: this.localIDs,
      },
      showDeleteDialog: false,
      logIDToDelete: null,
      logDisplayFilters: {
        date: 'ALL_TIME',
        // NOTE: We're tracking which types/categories to EXCLUDE, so we can manage
        // defaults more easily w/o having to poll the server for the list
        excludedTypes: [],
        excludedCategories: [],
      },
      isSyncing: false,
    };
  },
  props: [
    'useGeolocation',
    'userId',
    'systemOfMeasurement',
    'logTypes',
    'logs',
    'areas',
    'assets',
    'units',
    'categories',
    'equipment',
    'areaGeoJSON',
  ],
  created() {
    this.clearDisplayFilters();
    this.loadCachedDisplayFilters();
    const filter = {
      log_owner: this.userId,
      done: false,
    };
    const now = Math.floor(Date.now() / 1000);
    const tenDaysAgo = now - (60 * 60 * 24 * 10);
    const threeDaysFromNow = now + (60 * 60 * 24 * 3);
    const pass = {
      unsynced: true,
      timestamp: [tenDaysAgo, threeDaysFromNow],
    };
    this.loadLogs({ filter, pass });
  },
  methods: {
    sortLogsDescending(logs) {
      const compare = (logA, logB) => logB.timestamp - logA.timestamp;
      return sort(compare, logs);
    },

    /**
     * DELETION METHODS
     */
    openDeleteDialog(localID) {
      this.showDeleteDialog = true;
      this.logIDToDelete = localID;
    },
    cancelDelete() {
      this.showDeleteDialog = false;
    },
    confirmDelete() {
      this.deleteLog(this.logIDToDelete);
      this.showDeleteDialog = false;
      if (this.$route.name === 'tasks-edit') {
        this.$router.push({ path: '/tasks' });
      }
    },

    /**
     * SYNCING
     */
    sync(localID) {
      this.isSyncing = true;
      const pass = { localIDs: [localID] };
      this.syncLogs({ pass })
        .finally(() => { this.isSyncing = false; });
    },
    syncAll() {
      this.isSyncing = true;
      const filter = {
        log_owner: this.userId,
        done: false,
        timestamp: [null, (Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 10))],
      };
      const pass = {
        localIDs: this.localIDs,
      };
      this.syncLogs({ filter, pass })
        .finally(() => { this.isSyncing = false; });
      this.$store.dispatch('updateAssets');
      this.$store.dispatch('updateAreas');
      this.$store.dispatch('updateUnits');
      this.$store.dispatch('updateCategories');
    },

    /**
     * FILTER METHODS
     */
    addToExcludedTypes(type) {
      const newArr = this.logDisplayFilters.excludedTypes.concat(type);
      this.logDisplayFilters.excludedTypes = newArr;
      localStorage.setItem('excludedTypes', JSON.stringify(newArr));
    },
    removeFromExcludedTypes(type) {
      const newArr = this.logDisplayFilters.excludedTypes.filter(_type => (
        type !== _type
      ));
      this.logDisplayFilters.excludedTypes = newArr;
      localStorage.setItem('excludedTypes', JSON.stringify(newArr));
    },
    addToExcludedCategories(cat) {
      const newArr = this.logDisplayFilters.excludedCategories.concat(cat);
      this.logDisplayFilters.excludedCategories = newArr;
      localStorage.setItem('excludedCategories', JSON.stringify(newArr));
    },
    removeFromExcludedCategories(cat) {
      const newArr = this.logDisplayFilters.excludedCategories.filter(_cat => (
        cat !== _cat
      ));
      this.logDisplayFilters.excludedCategories = newArr;
      localStorage.setItem('excludedCategories', JSON.stringify(newArr));
    },
    setDateFilter(value) {
      this.logDisplayFilters.date = value;
      localStorage.setItem('dateFilter', value);
    },
    clearDisplayFilters() {
      this.logDisplayFilters = {
        date: 'ALL_TIME',
        excludedTypes: [],
        excludedCategories: [],
      };
    },
    loadCachedDisplayFilters() {
      const exTypes = JSON.parse(localStorage.getItem('excludedTypes'));
      const exCats = JSON.parse(localStorage.getItem('excludedCategories'));
      const date = localStorage.getItem('dateFilter');

      if (exTypes !== null) {
        exTypes.forEach(type => this.addToExcludedTypes(type));
      }
      if (exCats !== null) {
        exCats.forEach(cat => this.addToExcludedCategories(cat));
      }
      if (date !== null) {
        this.setDateFilter(date);
      }
    },
    resetDisplayFilters() {
      this.clearDisplayFilters();
      localStorage.setItem('excludedTypes', '[]');
      localStorage.setItem('excludedCategories', '[]');
      localStorage.setItem('dateFilter', 'ALL_TIME');
    },
    isUnsynced,
  },
  computed: {
    logToDelete() {
      return this.logs.find(log => log.localID === this.logIDToDelete);
    },
    localIDs() {
      return this.logs.map(log => log.localID);
    },
  },
};
</script>

<style lang="css" scoped>
  .modal {
    display: block;
    padding-right: 15px;
    overflow-x: hidden;
    overflow-y: auto;
    opacity: 1;
  }
  .modal-filter {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: #ccc;
    opacity: .5;
  }
  .modal-dialog {
    transform: translate(0,0);
    width: auto;
    margin: 3rem;
    pointer-events: none;
  }
  @media (min-width: 576px) {
    .modal-dialog {
      max-width: 500px;
      margin: 1.75rem auto;
    }
  }
</style>
