<template functional>

  <div class="widget">
    <slot></slot>
  </div>

</template>

<script>
export default {
  name: 'Widget',
};
</script>

<style scoped>
  .widget {
    padding: 1rem;
    text-align: center;
  }
</style>
