<template>
  <farm-main>
    <app-bar-options :title="$t('Home')"/>
    <home-widgets :modules="modules"/>
  </farm-main>
</template>

<script>
import fieldModules from '../field-modules';
import HomeWidgets from './HomeWidgets';

export default {
  name: 'HomeScreen',
  components: { HomeWidgets },
  data() {
    return {
      modules: fieldModules,
    };
  },
};

</script>
