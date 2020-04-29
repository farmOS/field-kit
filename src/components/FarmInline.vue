<script>
import { responsiveProps, mapResponsiveProps } from './responsiveProps';

export default {
  name: 'FarmInline',
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
    containerStyle() {
      return {
        marginTop: `-${this._space}`,
        marginLeft: `-${this._space}`,
        justifyContent: this._justifyContent,
      };
    },
    itemStyle() {
      return {
        paddingTop: this._space,
        paddingLeft: this._space,
      };
    },
  },
  render(h) {
    return h(
      'div',
      { class: 'farm-inline', style: this.containerStyle },
      this.$slots.default
        // Filtering out undefined tags removes unwanted whitespace nodes.
        .filter(node => node.tag !== undefined)
        .map(node => h(
          'div',
          { style: { ...this.itemStyle, flex: node.data?.attrs?.flex } },
          [node],
        )),
    );
  },
};
</script>

<style scoped>
.farm-inline {
  display: flex;
  flex-flow: row wrap;
}
</style>
