<template>
  <li class="farm-list-item list-group-item" :class="{ clickable }">
    <slot></slot>
  </li>
</template>

<script>
export default {
  name: 'FarmListItem',
  props: {
    clickable: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
  .clickable:hover {
    background-color: var(--light);
    cursor: pointer;
  }
</style>
