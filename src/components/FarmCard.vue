<template>

  <div :style="style">
    <slot></slot>
  </div>

</template>

<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'FarmCard',
  props: {
    backgroundColor: {
      type: String,
      default: '#fff',
    },
    boxShadow: {
      type: String,
      default: '1px 2px 3px #ccc',
    },
    breakpoints: {
      type: Array,
      default() {
        return [0, 740, 992];
      },
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
  data() {
    return {
      bpIndex: 0,
    };
  },
  created() {
    window.addEventListener('resize', this.calcBpIndex);
    this.calcBpIndex();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calcBpIndex);
  },
  computed: {
    _height() {
      return Array.isArray(this.height)
        ? this.height[this.bpIndex]
        : this.height;
    },
    _space() {
      return Array.isArray(this.space)
        ? this.space[this.bpIndex]
        : this.space;
    },
    _width() {
      return Array.isArray(this.width)
        ? this.width[this.bpIndex]
        : this.width;
    },
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
  methods: {
    calcBpIndex() {
      const bpMatches = bp => window.innerWidth >= bp;
      const breakpoint = Math.max(...this.breakpoints.filter(bpMatches));
      this.bpIndex = this.breakpoints.indexOf(breakpoint);
    },
  },
};
</script>
