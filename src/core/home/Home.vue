<template>
  <farm-main>
    <app-bar-options :title="$t('Home')"/>
    <home-widgets
      :modules="modules"
      :assets='assets'
      :logs="logs"
      :plans='plans'
      :quantities='quantities'
      :terms='terms'
      :users='users'/>
  </farm-main>
</template>

<script>
import fieldModules from '../field-modules';
import HomeWidgets from './HomeWidgets';

export default {
  name: 'HomeScreen',
  components: { HomeWidgets },
  props: [
    'assets',
    'logs',
    'plans',
    'quantities',
    'terms',
    'users',
  ],
  data() {
    return {
      modules: fieldModules,
    };
  },
};

</script>
