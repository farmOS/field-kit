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
    paddingX: [String, Array],
    paddingY: [String, Array],
    paddingTop: [String, Array],
    paddingRight: [String, Array],
    paddingBottom: [String, Array],
    paddingLeft: [String, Array],
  },
  computed: {
    ...mapResponsiveProps({
      _justifyContent: 'justifyContent',
      _space: 'space',
      _paddingX: 'paddingX',
      _paddingY: 'paddingY',
      _paddingTop: 'paddingTop',
      _paddingRight: 'paddingRight',
      _paddingBottom: 'paddingBottom',
      _paddingLeft: 'paddingLeft',
    }),
    style() {
      return {
        paddingTop: this._paddingTop || this._paddingY || this._space,
        paddingRight: this._paddingRight || this._paddingX || this._space,
        paddingBottom: this._paddingBottom || this._paddingY || this._space,
        paddingLeft: this._paddingLeft || this._paddingX || this._space,
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
