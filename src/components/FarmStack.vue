<script>
import { responsiveProps, mapResponsiveProps, responsiveValidator } from './responsiveProps';

export default {
  name: 'FarmStack',
  mixins: [responsiveProps],
  props: {
    space: {
      type: [String, Array],
      default: 'none',
      validator: responsiveValidator([
        'xxxs', 'xxs', 'xs', 's',
        'm', 'l', 'xl', 'xxl', 'none',
      ]),
    },
    dividers: {
      type: [Boolean, String],
      default: false,
    },
  },
  computed: mapResponsiveProps({
    _space: 'space',
    _dividers: 'dividers',
  }),
  render(h) {
    return h(
      'div',
      { class: `farm-stack ${this._space}`, style: { paddingTop: '1px' } },
      (this.$slots.default || [])
        // Filtering out undefined tags removes unwanted whitespace nodes.
        .filter(node => node.tag !== undefined)
        .map((node, i, arr) => {
          const style = { paddingTop: `var(--${this._space})` };
          // Derive the weight prop that may be passed to the farm-divider.
          const weight = typeof this._dividers === 'string'
            ? this._dividers
            : 'regular';
          // Add a divider if specified, and if there's only a single column, and if
          // the node is not the last element.
          const children = this._dividers && this._columns === 1 && i < arr.length - 1
            ? [node, h('farm-divider', { props: { weight } })]
            : [node];
          return h('div', { style }, children);
        }),
    );
  },
};
</script>

<style scoped>
.farm-stack::before {
  display: block;
  content: "";
}
.farm-stack.none::before {
  margin-top: calc(-1px - var(--none));
}
.farm-stack.xxxs::before {
  margin-top: calc(-1px - var(--xxxs));
}
.farm-stack.xxs::before {
  margin-top: calc(-1px - var(--xxs));
}
.farm-stack.xs::before {
  margin-top: calc(-1px - var(--xs));
}
.farm-stack.s::before {
  margin-top: calc(-1px - var(--s));
}
.farm-stack.m::before {
  margin-top: calc(-1px - var(--m));
}
.farm-stack.l::before {
  margin-top: calc(-1px - var(--l));
}
.farm-stack.xl::before {
  margin-top: calc(-1px - var(--xl));
}
.farm-stack.xxl::before {
  margin-top: calc(-1px - var(--xxl));
}
</style>
