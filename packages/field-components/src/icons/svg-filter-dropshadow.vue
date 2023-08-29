<template>
<svg height="0" width="0">
  <!-- based on https://stackoverflow.com/a/6094674/1549703 -->
  <filter :id="id" :height="height">
    <!-- stdDeviation is how much to blur -->
    <feGaussianBlur in="SourceAlpha" :stdDeviation="blur"/>
    <!-- how much to offset -->
    <feOffset :dx="x" :dy="y" result="offsetblur"/>
    <feComponentTransfer>
      <!-- slope is the opacity of the shadow -->
      <feFuncA type="linear" :slope="opacity"/>
    </feComponentTransfer>
    <feMerge>
      <!-- this contains the offset blurred image -->
      <feMergeNode/>
      <!-- this contains the element that the filter is applied to -->
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</svg>
</template>

<script>
export default {
  name: 'SvgFilterDropshadow',
  props: {
    id: {
      type: String,
      default: 'dropshadow',
    },
    height: {
      type: String,
      default: '130%',
    },
    x: {
      type: Number,
      default: 2,
    },
    y: {
      type: Number,
      default: 2,
    },
    opacity: {
      type: Number,
      default: 0.5,
    },
    blur: {
      type: Number,
      default: 3,
    },
  },
};
</script>

<style>

</style>
