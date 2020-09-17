<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" :fill="fill" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
</template>

<script>
export default {
  name: 'IconMenu',
  props: {
    width: {
      type: Number,
      default: 24,
    },
    height: {
      type: Number,
      default: 24,
    },
    fill: {
      type: String,
      default: 'var(--dark)',
    },
  },
};
</script>
