<template>
  <div class="modal-filter" @click="hideModal"></div>
</template>

<script>
export default {
  name: 'AppModal',
  emits: ['hideModal'],
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
