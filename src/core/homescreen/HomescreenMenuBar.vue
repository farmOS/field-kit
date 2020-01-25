<template>
  <menu-bar :more="false">
    <template #left-menu>
      <li @click="$emit('toggleDrawer')">
        <icon-menu/>
      </li>
      <li>Home</li>
    </template>
  </menu-bar>
</template>

<script>
import MenuBar from '@/components/MenuBar';
import IconMenu from '@/components/icons/icon-menu';

export default {
  name: 'HomescreenMenuBar',
  components: { MenuBar, IconMenu },
};
</script>

<style>

</style>
