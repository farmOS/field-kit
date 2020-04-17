<template>
  <div :style="style">
    <slot></slot>
  </div>
</template>

<script>
/* eslint-disable no-underscore-dangle */
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
      type: String,
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
      _height: 'height',
      _space: 'space',
      _width: 'width',
    }),
    style() {
      return {
        backgroundColor: this.backgroundColor,
        boxShadow: this.boxShadow,
        height: this._height,
        padding: this._space,
        width: this._width,
      };
    },
  },
};
</script>
