<template>
  <div>
    <router-view
      :isSyncing="isSyncing"
      @delete-current-log="openDeleteDialog($event)"
      @sync-all="syncAll"
      @sync="sync($event)"
      @reset-filters="resetFilters"
      @save-filters="saveFilters"
      @toggle-type-filter="toggleTypeFilter"
      @toggle-category-filter="toggleCategoryFilter"
      :filters="filters"
      :userId="user.id"
      :useGeolocation="settings.permissions.geolocation"
      :logs="sortedLogs"
      :areas="areas"
      :assets="assets"
      :allAssets="assets"
      :allAreas="areas"
      :allCategories="categories"
      :allEquipment="equipment"
      :allLogs="logs"
      :allUnits="units"
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
  R,
  isUnsynced,
} = window.lib;

const assetFilter = { status: 'active' };
const termFilter = { type: ['log_category', 'unit'] };

// Helper for transforming a object mapping keys to booleans, back into an array
// of those keys, as with type and category filters.
const objectToArray = obj => Object.entries(obj).reduce(
  (arr, [key, val]) => (!val ? arr : [...arr, key]),
  [],
);

const resetTypeFilters = (logTypes, cachedValues = {}) =>
  R.mapObjIndexed((_, key) => (key in cachedValues ? cachedValues[key] : true), logTypes);
const resetCategoryFilters = (categories, cachedValues = {}) =>
  categories.reduce((obj, { id }) => ({
    ...obj,
    [id]: id in cachedValues ? cachedValues[id] : true,
  }), { NO_CATEGORY: 'NO_CATEGORY' in cachedValues ? cachedValues.NO_CATEGORY : true });
const transformCategoryFilters = (categories) => {
  const { NO_CATEGORY, ...rest } = categories;
  const includedCats = objectToArray(rest);
  const allCats = Object.keys(rest);
  const filter = {};
  // If the list of included categories is the same length as the list of
  // all categories, then the defaults are still in place, and there is no
  // need to filter on the category property at all, so an empty object will
  // be spread into the ultimate filter passed to the store.
  if (includedCats.length < allCats.length) {
    const includedCatsFilter = {
      $in: { id: includedCats },
    };
    filter.category = includedCatsFilter;
  }
  // Likewise, only if NO_CATEGORY has been set true AND not all categories
  // are included, do we need to explicitly filter for no category.
  if (NO_CATEGORY && 'category' in filter) {
    const noCatFilter = { $nin: { id: allCats } };
    filter.category = [filter.category, noCatFilter];
  }
  return filter;
};

export default {
  name: 'TasksContainer',
  emits: ['open-drawer'],
  inject: ['alert'],
  data() {
    return {
      showDeleteDialog: false,
      logIDToDelete: null,
      filters: {
        types: {},
        categories: {
          NO_CATEGORY: true,
        },
      },
      isSyncing: false,
    };
  },
  props: [
    'user',
    'settings',
    'assets',
    'logs',
    'terms',
    'logTypes',
  ],
  created() {
    this.loadAssets(assetFilter);
    this.loadTerms(termFilter).then(() => {
      const cachedFilters = JSON.parse(localStorage.getItem('tasks-filters'));
      const { types, categories } = cachedFilters || {};
      this.filters = {
        types: resetTypeFilters(this.logTypes, types),
        categories: resetCategoryFilters(this.categories, categories),
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
          this.alert(e);
        })
        .finally(() => { this.isSyncing = false; });
    },

    /**
     * FILTER METHODS
     */
    toggleTypeFilter(type) {
      this.filters.types[type] = !this.filters.types[type];
      this.saveFilters();
    },
    toggleCategoryFilter(category) {
      this.filters.categories[category] = !this.filters.categories[category];
      this.saveFilters();
    },
    resetFilters() {
      this.filters = {
        types: resetTypeFilters(this.logTypes),
        categories: resetCategoryFilters(this.categories),
      };
      this.saveFilters();
    },
    transformFilters() {
      const { types, categories } = this.filters;
      const typesArray = objectToArray(types);
      const categoryFilter = transformCategoryFilters(categories);
      return {
        'owner.id': this.user.id,
        status: { $ne: 'done' },
        type: typesArray.length > 0 ? typesArray : undefined,
        ...categoryFilter,
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
