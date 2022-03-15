<template>
  <div>
    <router-view
      :userId="profile.user.id"
      :useGeolocation="settings.permissions.geolocation"
      :logs="logs"
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
  useEntities,
} = window.lib;
const { computed, inject } = window.Vue;

export default {
  name: 'TasksContainer',
  setup() {
    const profile = inject('profile');
    const settings = inject('settings');

    const { checkout } = useEntities();
    const assetFilter = { status: 'active' };
    const termFilter = { type: ['log_category', 'unit'] };
    const logFilter = {
      'owner.id': profile.user.id,
      status: { $ne: 'done' },
    };

    const assets = checkout('asset', assetFilter);
    const areas = computed(() => assets.filter(a => a.is_location));
    const equipment = computed(() => assets.filter(a => a.type === 'equipment'));

    const logs = checkout('log', logFilter);

    const terms = checkout('term', termFilter);
    const units = computed(() => terms.filter(t => t.type === 'unit'));
    const categories = computed(() => terms.filter(t => t.type === 'log_category'));

    return {
      areas, assets, categories, equipment, logs, profile, settings, terms, units,
    };
  },
};
</script>
