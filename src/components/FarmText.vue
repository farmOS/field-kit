<template>
  <p :style="style">
    <slot></slot>
  </p>
</template>

<script>
export default {
  name: 'FarmText',
  props: {
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
};
</script>

<style>

</style>
