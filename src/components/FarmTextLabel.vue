<script>
import { h } from 'vue';

export default {
  name: 'FarmTextLabel',
  props: {
    as: {
      type: String,
      default: 'label',
      validator(val) {
        return ['label', 'p', 'div', 'li', 'pre', 'input', 'span'].includes(val);
      },
    },
    size: {
      type: String,
      default: 'm',
      validator(val) {
        return ['s', 'm', 'l'].includes(val);
      },
    },
    color: {
      type: String,
      default: 'text',
      validator(val) {
        return [
          'text', 'dark', 'subtle', 'white',
          'primary', 'secondary', 'tertiary',
        ].includes(val);
      },
    },
  },
  computed: {
    style() {
      const fontSize = this.size === 's'
        ? '0.5625rem'
        : this.size === 'l'
          ? '1rem'
          : '0.75rem';
      const letterSpacing = this.size === 's'
        ? '0.15rem'
        : 'normal';
      const lineHeight = this.size === 's'
        ? 'var(--line-height-xs)'
        : this.size === 'l'
          ? 'var(--line-height)'
          : 'var(--line-height-s)';
      const color = `var(--${this.color})`;
      return {
        fontSize,
        lineHeight,
        color,
        letterSpacing,
        textTransform: 'uppercase',
      };
    },
  },
  render() {
    return h(
      this.as,
      { style: this.style },
      this.$slots.default(),
    );
  },
};
</script>

<style>

</style>
