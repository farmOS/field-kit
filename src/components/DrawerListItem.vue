<template functional>
  <li
    class="list-group-item"
    :class="{ clickable: props.clickable !== undefined ? props.clickable : true }">
    <slot></slot>
  </li>
</template>

<script>
export default {
  name: 'DrawerListItem',
};
</script>

<style scoped>
  .clickable:hover {
    background-color: #eee;
    cursor: pointer;
  }
</style>