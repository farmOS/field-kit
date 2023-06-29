<script>
import { h, Fragment } from 'vue';
import noEmptyVNodes from '../noEmptyVNodes';
import { responsiveProps, mapResponsiveProps, responsiveValidator } from '../responsiveProps';

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
  render() {
    const renderChildNode = (node, i, arr) => {
      // Derive the props and style attributes to be passed to farm-divider.
      const dividerAttrs = {
        weight: typeof this._dividers === 'string'
          ? this._dividers
          : 'regular',
        style: { paddingTop: `var(--${this._space})` },
      };
      // Add a divider if specified, and if there's only a single column, and if
      // the node is not the last element.
      const child = this._dividers && this._columns === 1 && i < arr.length - 1
        ? [node, h('farm-divider', { dividerAttrs })]
        : [node];
      return h(
        'div',
        { style: this.style2 },
        h(
          'div',
          { style: this.style3 },
          child,
        ),
      );
    };
    const rawSlots = this.$slots.default() || [];
    const nestedSlots = {
      default() {
        const fragment = rawSlots.find(n => n.type === Fragment);
        return (fragment ? fragment.children : rawSlots)
          .filter(noEmptyVNodes)
          .map(renderChildNode);
      },
    };
    return h(
      'div',
      { class: 'farm-tiles', style: this.style0 },
      h(
        'div',
        { style: this.style1 },
        nestedSlots,
      ),
    );
  },
};
</script>
