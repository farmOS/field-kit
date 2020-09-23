<script>
import { responsiveProps, mapResponsiveProps } from './responsiveProps';

export default {
  name: 'FarmStack',
  mixins: [responsiveProps],
  props: {
    space: {
      type: [String, Array],
      default: '0',
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
      { class: 'farm-stack' },
      (this.$slots.default || [])
        // Filtering out undefined tags removes unwanted whitespace nodes.
        .filter(node => node.tag !== undefined)
        .map((node, i, arr) => {
          // Apply padding to all but the last element.
          const style = (i < arr.length - 1)
            ? { paddingBottom: this._space }
            : {};
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
