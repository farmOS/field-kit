<template>
  <div class="farm-row" :style="{ paddingBottom: _space }">
    <slot></slot>
  </div>
</template>

<script>
import { responsiveProps, mapResponsiveProps } from './responsiveProps';

export default {
  name: 'FarmRow',
  mixins: [responsiveProps],
  props: {
    space: {
      type: [String, Array],
      default: '0',
    },
  },
  computed: mapResponsiveProps({
    _space: 'space',
  }),
};
</script>

<style scoped>
.farm-row {
  display: flex;
}
</style>
