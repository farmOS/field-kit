<template>
  <div class="farm-placeholder" :style="{ width, height }">
    <svg xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="0" x2="100%" y2="100%"></line>
      <line x1="100%" y1="0" x2="0" y2="100%"></line>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'FarmPlaceholder',
  props: {
    width: {
      type: String,
      default: '100px',
    },
    height: {
      type: String,
      default: '100px',
    },
  },
};
</script>

<style scoped>
.farm-placeholder {
  background: lightgrey;
  border: 3px solid grey;
}
.farm-placeholder svg {
  width: 100%;
  height: 100%;
  stroke: grey;
  stroke-width: 3px;
}
</style>
