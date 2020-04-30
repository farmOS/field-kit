<template>
  <div class="farm-card" :style="style">
    <slot></slot>
  </div>
</template>

<script>
import { responsiveProps, mapResponsiveProps } from './responsiveProps';

export default {
  name: 'FarmCard',
  mixins: [responsiveProps],
  props: {
    backgroundColor: {
      type: String,
      default: '#fff',
    },
    boxShadow: {
      type: [String, Array],
      default: '1px 2px 3px #ccc',
    },
    height: {
      type: [String, Array],
      default: 'auto',
    },
    space: {
      type: [String, Array],
      default: '1rem',
    },
    width: {
      type: [String, Array],
      default: 'auto',
    },
  },
  computed: {
    ...mapResponsiveProps({
      _boxShadow: 'boxShadow',
      _height: 'height',
      _space: 'space',
      _width: 'width',
    }),
    style() {
      return {
        backgroundColor: this.backgroundColor,
        boxShadow: this._boxShadow,
        height: this._height,
        padding: this._space,
        width: this._width,
      };
    },
  },
};
</script>
