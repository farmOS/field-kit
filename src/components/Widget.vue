<template functional>

  <div class="widget">
    <div class="box">
      <slot></slot>
    </div>
  </div>

</template>

<style scoped>

.box {
    margin-bottom: 20px;
    height:150px;
    background: #ffffff;
    border: 1px solid rgba(2, 154, 207, 1);
    border-radius: 10px;
    padding: 20px;
}

</style>
