<template>
  <div class="farm-divider">
    <div :style="style"></div>
  </div>
</template>

<script>
export default {
  name: 'FarmDivider',
  props: {
    weight: {
      type: String,
      default: 'regular',
    },
  },
  computed: {
    style() {
      return {
        height: '1px',
        backgroundColor: this.weight === 'strong' ? 'var(--subtle)' : 'var(--light)',
      };
    },
  },
};
</script>

<style>

</style>
