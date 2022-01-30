<template>
  <farm-menu-bar :more="false">
    <template #left-menu>
      <li @click="$emit('open-drawer')">
        <icon-menu/>
      </li>
      <li>{{ $t('Home')}}</li>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'HomeMenuBar',
  emits: ['open-drawer'],
};
</script>

<style>

</style>
