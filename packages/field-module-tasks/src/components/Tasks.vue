<template>
  <div>
    <router-view
      :isSyncing="isSyncing"
      @delete-current-log="openDeleteDialog($event)"
      @sync-all="syncAll"
      @sync="sync($event)"
      :filters="filters"
      :userId="profile.user.id"
      :useGeolocation="settings.permissions.geolocation"
      :logs="sortedLogs"
      :areas="areas"
      :assets="assets"
      :allAssets="assets"
      :allAreas="areas"
      :allCategories="categories"
      :allEquipment="equipment"
      :allLogs="logs"
      :allUnits="units"/>

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
const logFilter = {
  'owner.id': this.profile.user.id,
  status: { $ne: 'done' },
};

export default {
  name: 'TasksContainer',
  inject: ['alert', 'bundles', 'profile', 'settings'],
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
    'assets',
    'logs',
    'terms',
  ],
  created() {
    this.loadAssets(assetFilter);
    this.loadTerms(termFilter);
    this.loadLogs(logFilter, { includeUnsynced: true });
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
      this.syncLogs(logFilter)
        .catch((e) => {
          this.alert(e);
        })
        .finally(() => { this.isSyncing = false; });
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
