<template functional>
  <div
    class="widget"
    :class="{ clickable: props.clickable !== undefined ? props.clickable : true }">
    <slot></slot>
  </div>
</template>

<style scoped>
  .clickable:hover {
    background-color: #eee;
    cursor: pointer;
  }
</style>
