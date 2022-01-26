<template>
  <div class="modal-filter"></div>
</template>

<script>
export default {
  name: 'AppModal',
};
</script>

<style scoped>
.modal-filter {
  position: fixed;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: var(--dark-transparent);
  z-index: 1500;
}
</style>
