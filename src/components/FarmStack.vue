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
  },
  computed: mapResponsiveProps({
    _space: 'space',
  }),
  render(h) {
    return h(
      'div',
      { class: 'farm-stack' },
      this.$slots.default
        // Filtering out undefined tags removes unwanted whitespace nodes.
        .filter(node => node.tag !== undefined)
        .map((node, i, arr) => {
          // Apply padding to all but the last element.
          const style = (i < arr.length - 1)
            ? { paddingBottom: this._space }
            : {};
          return h('div', { style }, [node]);
        }),
    );
  },
};
</script>
