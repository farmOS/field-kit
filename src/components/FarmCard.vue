<template>
  <div class="farm-card" :style="style">
    <slot></slot>
  </div>
</template>

<script>
import {
  responsiveProps, mapResponsiveProps, mapResponsiveEnums, responsiveValidator,
} from './responsiveProps';

export default {
  name: 'FarmCard',
  mixins: [responsiveProps],
  props: {
    backgroundColor: {
      type: String,
      default: 'white',
      validator: val => [
        'white', 'dark', 'primary', 'secondary', 'tertiary',
        'purple', 'red', 'orange', 'yellow', 'green', 'blue',
      ].includes(val),
    },
    boxShadow: {
      type: [String, Array],
      default: 'normal',
      validator: responsiveValidator([
        'normal', 'strong', 'inverse', 'none',
      ]),
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
      default: 'full',
      validator: responsiveValidator([
        's', 'm', 'l', 'xl', 'full', 'content',
      ]),
    },
  },
  computed: {
    ...mapResponsiveProps({
      _boxShadow: 'boxShadow',
      _height: 'height',
      _space: 'space',
    }),
    ...mapResponsiveEnums({
      backgroundColor: {
        white: 'var(--white)',
        dark: 'var(--dark)',
        primary: 'var(--accent-primary)',
        secondary: 'var(--accent-secondary)',
        tertiary: 'var(--accent-tertiary)',
        purple: 'var(--accent-purple)',
        red: 'var(--accent-red)',
        orange: 'var(--accent-orange)',
        yellow: 'var(--accent-yellow)',
        green: 'var(--accent-green)',
        blue: 'var(--accent-blue)',
      },
      width: {
        s: 'var(--xl)',
        m: 'calc(var(--xl) * 2)',
        l: 'calc(var(--xl) * 3)',
        xl: 'calc(var(--xl) * 4)',
        full: 'auto',
        content: 'fit-content',
      },
      boxShadow: {
        normal: 'var(--shadow)',
        strong: 'var(--shadow-strong)',
        inverse: 'var(--shadow-inverse)',
        none: 'none',
      },
    }),
    style() {
      return {
        backgroundColor: this._backgroundColor,
        boxShadow: this._boxShadow,
        height: this._height,
        padding: `var(--${this._space})`,
        width: this._width,
      };
    },
  },
};
</script>
