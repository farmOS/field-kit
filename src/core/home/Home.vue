<template>
  <farm-main>
    <home-widgets
      :modules="modules"
      :user="user"
      :farm='farm'
      :settings='settings'
      :assets='assets'
      :logs="logs"
      :plans='plans'
      :quantities='quantities'
      :terms='terms'
      :users='users'
      :assetTypes='assetTypes'
      :logTypes='logTypes'
      :planTypes='planTypes'
      :quantityTypes='quantityTypes'
      :termTypes='termTypes'
      :userTypes='userTypes'
      :areaGeoJSON='areaGeoJSON'/>
  </farm-main>
</template>

<script>
import { mapState } from 'vuex';
import HomeWidgets from './HomeWidgets';

export default {
  name: 'Home',
  components: { HomeWidgets },
  props: [
    'user',
    'farm',
    'settings',
    'assets',
    'logs',
    'plans',
    'quantities',
    'terms',
    'users',
    'assetTypes',
    'logTypes',
    'planTypes',
    'quantityTypes',
    'termTypes',
    'userTypes',
    'areaGeoJSON',
  ],
  computed: {
    ...mapState({
      modules: state => state.modules,
    }),
  },
};

</script>
