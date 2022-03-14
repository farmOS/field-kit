<template>
  <div>
    <router-view
      :isSyncing="isSyncing"
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
  },
};
</script>
