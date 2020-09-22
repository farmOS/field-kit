<template>
  <main :style="style">
    <div class="content">
      <slot></slot>
    </div>
  </main>
</template>

<script>
import { mapResponsiveProps, responsiveProps } from './responsiveProps';

export default {
  name: 'FarmMain',
  mixins: [responsiveProps],
  props: {
    justifyContent: {
      type: [String, Array],
      default: 'flex-start',
    },
    space: {
      type: [String, Array],
      default: '1rem',
    },
  },
  computed: {
    ...mapResponsiveProps({
      _justifyContent: 'justifyContent',
      _space: 'space',
    }),
    style() {
      return {
        padding: this._space,
      };
    },
  },
};
</script>

<style scoped>
main {
  background-color: var(--light);
}

.content {
  min-height: calc(100vh - 3rem);
  max-width: 1200px;
  margin: auto;
}
</style>
