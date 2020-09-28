<template>
  <main>
    <div class="content" :style="style">
      <slot></slot>
    </div>
  </main>
</template>

<script>
import { mapResponsiveProps, responsiveProps, responsiveValidator } from './responsiveProps';

const paddingProp = {
  type: [String, Array],
  validator: responsiveValidator([
    'xxxs', 'xxs', 'xs', 's',
    'm', 'l', 'xl', 'xxl', 'none',
  ]),
};

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
      default: 's',
      validator: responsiveValidator([
        'xxxs', 'xxs', 'xs', 's',
        'm', 'l', 'xl', 'xxl', 'none',
      ]),
    },
    paddingX: paddingProp,
    paddingY: paddingProp,
    paddingTop: paddingProp,
    paddingRight: paddingProp,
    paddingBottom: paddingProp,
    paddingLeft: paddingProp,
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
        justifyContent: this._justifyContent,
        paddingTop: `var(--${this._paddingTop || this._paddingY || this._space})`,
        paddingRight: `var(--${this._paddingRight || this._paddingX || this._space})`,
        paddingBottom: `var(--${this._paddingBottom || this._paddingY || this._space})`,
        paddingLeft: `var(--${this._paddingLeft || this._paddingX || this._space})`,
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
