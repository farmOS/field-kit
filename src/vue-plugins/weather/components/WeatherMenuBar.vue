<template>
  <menu-bar :more="false">
    <template #left-menu>
      <li @click="$emit('toggleDrawer')">
        <icon-menu/>
      </li>
      <li>Weather</li>
    </template>
  </menu-bar>
</template>

<script>
import MenuBar from '@/client/components/MenuBar';
import IconMenu from '@/icons/icon-menu';

export default {
  name: 'WeatherMenuBar',
  components: { MenuBar, IconMenu },
}
</script>

<style>

</style>