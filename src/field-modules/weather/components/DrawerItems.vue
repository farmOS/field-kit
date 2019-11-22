<template>
  <drawer-list>
    <router-link :to="{ name: 'weather-form' }">
      <drawer-list-item>Record Weather Event</drawer-list-item>
    </router-link>
  </drawer-list>
</template>

<script>
import DrawerList from '@/components/DrawerList';
import DrawerListItem from '@/components/DrawerListItem';

export default {
  components: {
    DrawerList,
    DrawerListItem,
  },
}
</script>

<style >
  a, a:hover {
    text-decoration: none;
    color: inherit;
  }
</style>