<template>
  <farm-menu-bar :more="false">
    <template #left-menu>
      <li @click="$emit('toggleDrawer')">
        <icon-menu/>
      </li>
      <li>Home</li>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'HomeMenuBar',
};
</script>

<style>

</style>
