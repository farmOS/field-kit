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
    alignItems: {
      type: [String, Array],
      default: 'stretch',
    },
    space: {
      type: [String, Array],
      default: 'none',
      validator(val) {
        return [
          'none', 'xxxs', 'xxs', 'xs', 's',
          'm', 'l', 'xl', 'xxl',
        ].includes(val);
      },
    },
  },
  computed: {
    ...mapResponsiveProps({
      _justifyContent: 'justifyContent',
      _alignItems: 'alignItems',
      _space: 'space',
    }),
    containerStyle() {
      return {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: this._justifyContent,
        alignItems: this._alignItems,
        marginLeft: `calc(var(--${this._space}) * -1)`,
      };
    },
    itemStyle() {
      return {
        marginTop: `var(--${this._space})`,
        marginLeft: `var(--${this._space})`,
      };
    },
  },
  render(h) {
    return h(
      'div',
      { class: `farm-inline ${this._space}`, style: { paddingTop: '1px' } },
      [h(
        'div',
        { style: this.containerStyle },
        (this.$slots.default || [])
          // Filtering out undefined tags removes unwanted whitespace nodes.
          .filter(node => node.tag !== undefined)
          .map(node => h(
            'div',
            { style: { ...this.itemStyle, flex: node.data?.attrs?.flex } },
            [node],
          )),
      )],
    );
  },
};
</script>

<style scoped>
.farm-inline::before {
  display: block;
  content: "";
}
.farm-inline.none::before {
  margin-top: calc(-1px - var(--none));
}
.farm-inline.xxxs::before {
  margin-top: calc(-1px - var(--xxxs));
}
.farm-inline.xxs::before {
  margin-top: calc(-1px - var(--xxs));
}
.farm-inline.xs::before {
  margin-top: calc(-1px - var(--xs));
}
.farm-inline.s::before {
  margin-top: calc(-1px - var(--s));
}
.farm-inline.m::before {
  margin-top: calc(-1px - var(--m));
}
.farm-inline.l::before {
  margin-top: calc(-1px - var(--l));
}
.farm-inline.xl::before {
  margin-top: calc(-1px - var(--xl));
}
.farm-inline.xxl::before {
  margin-top: calc(-1px - var(--xxl));
}
</style>
