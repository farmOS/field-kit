<script>
import { responsiveProps, mapResponsiveProps, responsiveValidator } from './responsiveProps';

export default {
  name: 'FarmTiles',
  mixins: [responsiveProps],
  props: {
    columns: {
      type: [Number, Array],
      default: () => [1, 2, 3],
      validator: val => (
        Array.isArray(val)
          ? val.every(v => typeof v === 'number')
          : typeof val === 'number'
      ),
    },
    space: {
      type: [String, Array],
      default: 's',
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
  computed: {
    ...mapResponsiveProps({
      _columns: 'columns',
      _space: 'space',
      _dividers: 'dividers',
    }),
    style0() {
      return {
        marginTop: `calc(var(--${this._space}) * -1)`,
        marginLeft: `calc(var(--${this._space}) * -1)`,
      };
    },
    style1() {
      return {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'start',
      };
    },
    style2() {
      return {
        flex: `0 0 ${100 / this._columns}%`,
        // B/c setting flex basis doesn't seem to be enough to contain contents:
        width: `${100 / this._columns}%`,
      };
    },
    style3() {
      return {
        paddingTop: `var(--${this._space})`,
        paddingLeft: `var(--${this._space})`,
        height: '100%',
      };
    },
  },
  render(h) {
    const renderChildNodes = (node, i, arr) => {
      // Derive the props and style attributes to be passed to farm-divider.
      const dividerAttrs = {
        props: {
          weight: typeof this._dividers === 'string'
            ? this._dividers
            : 'regular',
        },
        style: { paddingTop: `var(--${this._space})` },
      };
      // Add a divider if specified, and if there's only a single column, and if
      // the node is not the last element.
      const children = this._dividers && this._columns === 1 && i < arr.length - 1
        ? [node, h('farm-divider', dividerAttrs)]
        : [node];
      return h(
        'div',
        { style: this.style2 },
        [h(
          'div',
          { style: this.style3 },
          children,
        )],
      );
    };
    return h(
      'div',
      { class: 'farm-tiles', style: this.style0 },
      [h(
        'div',
        { style: this.style1 },
        (this.$slots.default || [])
          // Filtering out undefined tags removes unwanted whitespace nodes.
          .filter(node => node.tag !== undefined)
          .map(renderChildNodes),
      )],
    );
  },
};
</script>
