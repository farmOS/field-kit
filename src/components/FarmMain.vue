<template>
  <main :style="style">
    <slot></slot>
  </main>
</template>

<script>
import { mapResponsiveProps, responsiveProps } from './responsiveProps';

export default {
  name: 'FarmMain',
  mixins: [responsiveProps],
  props: {
    justifyContent: {
      type: [String, Array],
      default: 'flex-start',
    },
    space: {
      type: [String, Array],
      default: '1rem',
    },
  },
  computed: {
    ...mapResponsiveProps({
      _justifyContent: 'justifyContent',
      _space: 'space',
    }),
    style() {
      return {
        padding: this._space,
      };
    },
  },
};
</script>

<style>
</style>
