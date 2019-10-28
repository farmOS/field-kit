<template>
  <menu-bar :more="false">
    <template #left-menu>
      <router-link :to="logLink" tag="li">
        <icon-arrow-back/>
      </router-link>
      <li>Map</li>
    </template>
  </menu-bar>
</template>

<script>
import MenuBar from '@/components/MenuBar';
import IconArrowBack from '@/components/icons/icon-arrow-back';

export default {
  name: 'EditMapMenuBar',
  components: { MenuBar, IconArrowBack },
  props: ['logs', 'id'],
  computed: {
    logLink() {
      return {
        name: 'edit-log',
        params: {
          id: this.id,
          tab: 'SECOND',
        },
      };
    },
  },
}
</script>
