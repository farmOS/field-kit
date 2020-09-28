<template>
  <div class="farm-card" :style="style">
    <slot></slot>
  </div>
</template>

<script>
import {
  responsiveProps, mapResponsiveProps, responsiveValidator,
} from './responsiveProps';

export default {
  name: 'FarmCard',
  mixins: [responsiveProps],
  props: {
    backgroundColor: {
      type: String,
      default: 'var(--white)',
    },
    boxShadow: {
      type: [String, Array],
      default: 'var(--shadow)',
    },
    height: {
      type: [String, Array],
      default: 'auto',
    },
    space: {
      type: [String, Array],
      default: 's',
      validator: responsiveValidator([
        'xxxs', 'xxs', 'xs', 's',
        'm', 'l', 'xl', 'xxl', 'none',
      ]),
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
        padding: `var(--${this._space})`,
        width: this._width,
      };
    },
  },
};
</script>
