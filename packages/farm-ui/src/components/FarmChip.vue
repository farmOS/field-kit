<template>
  <div class="farm-chip" :class="sizeClass" :style="style">
    <svg-filter-dropshadow
      v-if="disableClose"
      id="farm-chip-close-shadow"
      :opacity=".25"
      :blur="3"
      :x="1"
      :y="2"/>
    <farm-text :size="size" as="span" weight=strong :color="textColor">
      <icon-cancel
        :fill="fill"
        :style="{ filter: 'url(#farm-chip-close-shadow)' }"
        :width="_size"
        :height="_size"/>
      <slot></slot>
    </farm-text>
  </div>
</template>

<script>
import { mapResponsiveEnums } from '../responsiveProps';

export default {
  name: 'FarmChip',
  props: {
    color: {
      type: String,
      default: 'blue',
      validator: val => [
        'purple', 'red', 'orange',
        'yellow', 'green', 'blue',
      ].includes(val),
    },
    size: {
      type: String,
      default: 'm',
      validator: val => [
        's', 'm', 'l',
      ].includes(val),
    },
    disableClose: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapResponsiveEnums({
      size: {
        s: 24,
        m: 24,
        l: 32,
      },
    }),
    sizeClass() {
      return {
        s: this.size === 's',
        m: this.size === 'm',
        l: this.size === 'l',
      };
    },
    style() {
      const fill = this.disableClose
        ? `var(--${this.color})`
        : this.color === 'yellow'
          ? 'var(--dark)'
          : 'var(--white)';
      return {
        fill,
        background: `var(--${this.color})`,
        color: this.color === 'yellow' ? 'var(--dark)' : 'var(--white)',
      };
    },
    fill() {
      return this.disableClose
        ? `var(--${this.color})`
        : this.color === 'yellow'
          ? 'var(--dark)'
          : 'var(--white)';
    },
    textColor() {
      return this.color === 'yellow'
        ? 'dark'
        : 'white';
    },
  },
};
</script>

<style>
.farm-chip {
  width: fit-content;
  border-radius: var(--m) var(--s) var(--s) var(--m);
  padding: var(--xs);
}
.farm-chip.s {
  border-radius: 1rem .5rem .5rem 1rem;
  padding: .25rem;
}
.farm-chip.l {
  border-radius: var(--l) var(--m) var(--m) var(--l);
  padding: var(--s);
}
.farm-chip span {
  vertical-align: middle;
}
.farm-chip svg {
  display: inline-block;
  vertical-align: middle;
  margin-top: -2px;
}
</style>
