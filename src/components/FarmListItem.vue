<template functional>
  <li
    class="farm-list-item list-group-item"
    :class="{ clickable: props.clickable !== undefined ? props.clickable : true }"
    v-on="listeners">
    <slot></slot>
  </li>
</template>

<script>
export default {
  name: 'FarmListItem',
};
</script>

<style scoped>
  .clickable:hover {
    background-color: #eee;
    cursor: pointer;
  }
</style>
