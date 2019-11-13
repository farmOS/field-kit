<template lang="html">
  <div>
    <router-view
      name="menubar"
      @toggleDrawer="$emit('toggleDrawer')"
      @deleteCurrentLog="openDeleteDialog($event)"
      @syncAll="syncAll"
      @resetDisplayFilters="resetDisplayFilters"
      :logs='logs'
    />
    <router-view
      @deleteLog="openDeleteDialog($event)"
      @addToExcludedTypes="addToExcludedTypes($event)"
      @removeFromExcludedTypes="removeFromExcludedTypes($event)"
      @addToExcludedCategories="addToExcludedCategories($event)"
      @removeFromExcludedCategories="removeFromExcludedCategories($event)"
      @setDateFilter="setDateFilter($event)"
      :logs='logs'
      :areas='areas'
      :assets='assets'
      :useGeolocation='useGeolocation'
      :units='units'
      :categories='categories'
      :equipment='equipment'
      :userId='userId'
      :logDisplayFilters='logDisplayFilters'
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
            <h5 class="modal-title" id="exampleModalLabel">Confirm Deletion</h5>
            <button
              type="button"
              class="close"
              @click='cancelDelete'
              aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            Are sure you'd like to delete the log "{{logs[logIndexToDelete].name.data}}"?&nbsp;
            <span
              v-if='logs[logIndexToDelete].wasPushedToServer'>
              Deleting it on this device will not remove the log from the server.
            </span>
            <span v-else>
              It has not yet been synced to the server and cannot be recovered after it's deleted.
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
  </div>
</template>

<script>
export default {
  name: 'Logs',
  data() {
    return {
      showDeleteDialog: false,
      logIndexToDelete: null,
      logDisplayFilters: {
        date: 'ALL_TIME',
        // NOTE: We're tracking which types/categories to EXCLUDE, so we can manage
        // defaults more easily w/o having to poll the server for the list
        excludedTypes: [],
        excludedCategories: [],
      },
    };
  },
  props: [
    'useGeolocation',
    'userId',
    'logs',
    'areas',
    'assets',
    'units',
    'categories',
    'equipment',
    ],
  created() {
    this.clearDisplayFilters();
    this.loadCachedDisplayFilters();
  },
  methods: {
    /**
     * DELETION METHODS
     */
    openDeleteDialog(index) {
      this.showDeleteDialog = true;
      this.logIndexToDelete = index;
    },
    cancelDelete() {
      this.showDeleteDialog = false;
    },
    confirmDelete() {
      const log = this.logs[this.logIndexToDelete];
      const payload = {
        index: this.logIndexToDelete,
        localID: log.localID,
        id: log.id,
        remoteUri: log.remoteUri,
        name: log.name.data,
        type: log.type.data,
      };
      this.$store.commit('deleteLog', payload);
      this.showDeleteDialog = false;
      if (this.$route.name === 'edit-log') {
        this.$router.push({ path: '/logs' });
      }
    },

    /**
     * SYNCING
     */
    syncAll() {
      this.$store.dispatch('syncAllLogs');
      this.$store.dispatch('updateAssets');
      this.$store.dispatch('updateAreas');
      this.$store.dispatch('updateUnits');
      this.$store.dispatch('updateCategories');
      this.$store.dispatch('updateEquipment');
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
  }
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
