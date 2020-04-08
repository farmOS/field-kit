<template>

  <div class="farm-card">
    <slot></slot>
  </div>

</template>

<script>
export default {
  name: 'FarmCard',
};
</script>

<style scoped>
  .farm-card {
    background-color: #fff;
    height: 100%;
    padding: 1rem;
    box-shadow: #ccc 1px 2px 3px;
  }
</style>
