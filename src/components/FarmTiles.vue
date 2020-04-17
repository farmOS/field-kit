<script>
/* eslint-disable no-underscore-dangle */
import { responsiveProps, mapResponsiveProps } from './responsiveProps';

export default {
  name: 'FarmTiles',
  mixins: [responsiveProps],
  props: {
    columns: {
      type: [Number, Array],
      default: 3,
    },
    space: {
      type: [String, Array],
      default: '1rem',
    },
    overflow: {
      type: String,
      default: 'hidden',
    },
  },
  computed: {
    ...mapResponsiveProps({
      _columns: 'columns',
      _space: 'space',
    }),
    style0() {
      return {
        marginTop: `-${this._space}`,
        marginLeft: `-${this._space}`,
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
        overflow: this.overflow,
      };
    },
    style3() {
      return {
        paddingTop: `${this._space}`,
        paddingLeft: `${this._space}`,
        height: '100%',
      };
    },
  },
  render(h) {
    return h(
      'div',
      { style: this.style0 },
      [h(
        'div',
        { style: this.style1 },
        this.$slots.default
          // Filtering out undefined tags removes unwanted whitespace nodes.
          .filter(node => node.tag !== undefined)
          .map(node => h(
            'div',
            { style: this.style2 },
            [h(
              'div',
              { style: this.style3 },
              [node],
            )],
          )),
      )],
    );
  },
};
</script>
