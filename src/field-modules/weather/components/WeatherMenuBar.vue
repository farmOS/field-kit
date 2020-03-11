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
export default {
  name: 'WeatherMenuBar',
};
</script>

<style>

</style>
