<script>
export default {
  name: 'FarmText',
  props: {
    as: {
      type: String,
      default: 'p',
      validator(val) {
        return ['p', 'div', 'span', 'li', 'pre', 'label', 'input'].includes(val);
      },
    },
    size: {
      type: String,
      default: 'm',
      validator(val) {
        return ['s', 'm', 'l', 'xl'].includes(val);
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
    weight: {
      type: String,
      default: 'regular',
    },
  },
  computed: {
    style() {
      const fontSize = this.size === 's'
        ? '0.75rem'
        : this.size === 'l'
          ? '1.25rem'
          : this.size === 'xl'
            ? '1.5rem'
            : '1rem';
      const lineHeight = this.size === 'xl'
        ? 'var(--line-height-xl)'
        : 'var(--line-height)';
      const fontWeight = this.weight === 'strong'
        ? 'bold'
        : 'normal';
      const color = `var(--${this.color})`;
      return {
        fontSize,
        lineHeight,
        fontWeight,
        color,
      };
    },
  },
  render(h) {
    return h(
      this.as,
      { class: 'farm-text', style: this.style },
      this.$slots.default,
    );
  },
};
</script>

<style>

</style>
