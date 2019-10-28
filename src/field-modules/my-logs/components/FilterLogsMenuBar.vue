<template>
  <menu-bar>
    <template #left-menu>
      <router-link :to="{ name: 'logs' }" tag="li">
        <icon-arrow-back/>
      </router-link>
      <li>Log Filters</li>
    </template>
    <template #more-menu>
      <li @click="resetDisplayFilters">Reset filters</li>
    </template>
  </menu-bar>
</template>

<script>
import MenuBar from "@/client/components/MenuBar";
import IconArrowBack from '@/icons/icon-arrow-back';

export default {
  name: 'AllLogsMenuBar',
  components: {
    MenuBar,
    IconArrowBack,
  },
  data() {
    return {
      showMore: false,
    };
  },
  methods: {
    resetDisplayFilters() {
      this.$emit('resetDisplayFilters');
    },
  },

};
</script>
