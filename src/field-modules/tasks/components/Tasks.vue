<template lang="html">
  <div>
    <router-view
      name="menubar"
      @toggle-drawer="$emit('toggle-drawer')"
      @delete-current-log="openDeleteDialog($event)"
      @sync-all="syncAll"
      @sync="sync($event)"
      @reset-filters="resetFilters"
      :logs="logs"
      :isSyncing="isSyncing"
    />
    <router-view
      @toggle-type-filter="toggleTypeFilter"
      @toggle-category-filter="toggleCategoryFilter"
      @set-time-filter="setTimeFilter"
      :userId="user.id"
      :useGeolocation="settings.useGeolocation"
      :areaGeoJSON="areaGeoJSON"
      :logs="sortedLogs"
      :areas="areas"
      :assets="assets"
      :units="units"
      :categories="categories"
      :equipment="equipment"
      :logTypes="logTypes"
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
              @click="cancelDelete"
              aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            {{ $t('Are sure you\'d like to delete the log')}} "{{logToDelete.name}}"?&nbsp;
            <span
              v-if="isUnsynced(logToDelete)">
              <!-- eslint-disable-next-line max-len -->
              {{ $t('It has not yet been synced to the server and cannot be recovered after it\'s deleted.')}}
            </span>
            <span v-else>
              {{ $t('Deleting it on this device will not remove the log from the server.') }}
            </span>
          </div>
          <div class="modal-footer">
            <button
            type="button"
            class="btn btn-secondary"
            @click="cancelDelete">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click="confirmDelete">
            Delete
          </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const {
  lib: { R },
  meta: { isUnsynced },
} = window.farmOS;

const assetFilter = { status: 'active' };
const termFilter = { type: ['log_category', 'unit'] };

const setTypeFilters = (logTypes, cachedValues = {}) =>
  R.mapObjIndexed((_, key) => (key in cachedValues ? cachedValues[key] : true), logTypes);
const setCategoryFilters = (cats, cachedValues = {}) => cats.map(({ id }) => ({
  [id]: id in cachedValues ? cachedValues[id] : true,
}));
const setTimeFilter = (now, cachedValues) =>
  (Array.isArray(cachedValues)
    ? cachedValues
    : []);

export default {
  name: 'Tasks',
  data() {
    return {
      showDeleteDialog: false,
      logIDToDelete: null,
      filters: {
        types: {},
        categories: {},
        time: [],
      },
      isSyncing: false,
    };
  },
  props: [
    'user',
    'settings',
    'areaGeoJSON',
    'assets',
    'logs',
    'terms',
    'logTypes',
  ],
  created() {
    this.loadAssets(assetFilter);
    this.loadTerms(termFilter).then(() => {
      const cachedFilters = JSON.parse(localStorage.getItem('tasks-filters'));
      const { types, categories, time } = cachedFilters || {};
      this.filters = {
        types: setTypeFilters(this.logTypes, types),
        categories: setCategoryFilters(this.categories, categories),
        time: setTimeFilter(Date.now(), time),
      };
      const filter = this.transformFilters();
      this.loadLogs(filter, { includeUnsynced: true });
    });
  },
  methods: {
    isUnsynced,
    /**
     * DELETION METHODS
     */
    openDeleteDialog(id) {
      this.showDeleteDialog = true;
      this.logIDToDelete = id;
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
    sync(id) {
      this.isSyncing = true;
      this.syncLogs({ id })
        .finally(() => { this.isSyncing = false; });
    },
    syncAll() {
      this.isSyncing = true;
      const filter = this.transformFilters();
      this.syncLogs(filter)
        .catch((e) => {
          this.$store.commit('alert', e);
        })
        .finally(() => { this.isSyncing = false; });
      this.syncAssets(assetFilter);
      this.syncTerms(termFilter);
    },

    /**
     * FILTER METHODS
     */
    toggleTypeFilter(type) {
      this.filters.types[type] = !this.filters.types[type];
    },
    toggleCategoryFilter(category) {
      this.filters.categories[category] = !this.filters.categories[category];
    },
    setTimeFilter(time) {
      this.filters.time = time;
    },
    resetFilters() {
      this.filters = {
        types: setTypeFilters(this.logTypes),
        categories: setCategoryFilters(this.categories),
        time: setTimeFilter(Date.now()),
      };
    },
    transformFilters() {
      const objectToArray = obj => Object.entries(obj).reduce(
        (arr, [key, val]) => (!val ? arr : [...(arr || []), key]),
        undefined,
      );
      const { types, categories, time: [start, end] } = this.filters;
      const includedCats = objectToArray(categories);
      const catFilter = {};
      // If default category filters are in place, there is no need to filter
      // on the category property at all, hence the empty object.
      if (includedCats.length < this.categories.length) {
        const includedCatsFilter = {
          $in: { id: includedCats },
        };
        // TODO: This filter should only be added conditionally.
        const noCatFilter = {
          $nin: { id: this.categories.map(R.prop('id')) },
        };
        catFilter.category = [includedCatsFilter, noCatFilter];
      }
      let timeFilter = {}; const timestamp = {};
      if (start) timestamp.$gte = start;
      if (end) timestamp.$lte = end;
      if ('$gte' in timestamp || '$lte' in timestamp) timeFilter = { timestamp };
      return {
        'owner.id': this.user.id,
        status: { $ne: 'done' },
        type: objectToArray(types),
        ...catFilter,
        ...timeFilter,
      };
    },
    saveFilters() {
      localStorage.setItem('tasks-filters', JSON.stringify(this.filters));
      const filter = this.transformFilters();
      this.loadLogs(filter, { includeUnsynced: true });
    },
  },
  computed: {
    areas() {
      return this.assets.filter(a => a.is_location);
    },
    equipment() {
      return this.assets.filter(a => a.type === 'equipment');
    },
    units() {
      return this.terms.filter(t => t.type === 'unit');
    },
    categories() {
      return this.terms.filter(t => t.type === 'log_category');
    },
    sortedLogs() {
      const compare = (logA, logB) =>
        new Date(logB.timestamp) - new Date(logA.timestamp);
      return R.sort(compare, this.logs);
    },
    logToDelete() {
      return this.logs.find(log => log.id === this.logIDToDelete);
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
    background-color: var(--dark-transparent);
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
