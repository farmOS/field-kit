<script>
import noEmptyVNodes from './noEmptyVNodes';
import {
  responsiveProps, mapResponsiveProps, responsiveValidator, mapResponsiveEnums,
} from './responsiveProps';

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
    align: {
      type: [String, Array],
      default: 'left',
      validator: responsiveValidator([
        'left', 'right', 'center',
      ]),
    },
    dividers: {
      type: [Boolean, String],
      default: false,
    },
  },
  computed: {
    ...mapResponsiveProps({
      _space: 'space',
      _dividers: 'dividers',
    }),
    ...mapResponsiveEnums({
      align: {
        left: 'flex-start',
        right: 'flex-end',
        center: 'center',
      },
    }),
  },
  render() {
    const { h } = window.Vue;
    return h(
      'div',
      { class: `farm-stack ${this._space}`, style: { paddingTop: '1px' } },
      (this.$slots.default() || [])
        // Filtering out undefined tags removes unwanted whitespace nodes.
        .filter(noEmptyVNodes)
        .map((node, i, arr) => {
          const style = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: this._align,
            paddingTop: `var(--${this._space})`,
          };
          // Derive the props and style attributes to be passed to farm-divider.
          const dividerAttrs = {
            weight: typeof this._dividers === 'string'
              ? this._dividers
              : 'regular',
            style: { paddingTop: `var(--${this._space})` },
          };
          // Add a divider if specified and the node is not the last element.
          const children = this._dividers && i < arr.length - 1
            ? [node, h('farm-divider', dividerAttrs)]
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
