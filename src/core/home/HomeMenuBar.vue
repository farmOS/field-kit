<template>
  <farm-menu-bar :more="false">
    <template #left-menu>
      <li @click="$emit('openDrawer')">
        <icon-menu/>
      </li>
      <li>{{ $t('Home')}}</li>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'HomeMenuBar',
  emits: ['openDrawer'],
};
</script>

<style>

</style>
