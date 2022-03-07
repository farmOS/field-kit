<template>
  <farm-main>
    <app-bar-options :title="$t('Home')"/>
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
      :userTypes='userTypes'/>
  </farm-main>
</template>

<script>
import fieldModules from '../field-modules';
import HomeWidgets from './HomeWidgets';

export default {
  name: 'HomeScreen',
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
  ],
  data() {
    return {
      modules: fieldModules,
    };
  },
};

</script>
