<template>
  <div class="farm-chip" :class="colorClass">
    <svg-filter-dropshadow
      v-if="disableClose"
      id="farm-chip-close-shadow"
      :opacity=".25"
      :blur="3"
      :x="1"
      :y="2"/>
    <icon-cancel :fill="cancelFill" :style="{ filter: 'url(#farm-chip-close-shadow)' }"/>
    <span><slot></slot></span>
  </div>
</template>

<script>
export default {
  name: 'FarmChip',
  props: {
    color: {
      type: String,
      default: 'cyan',
      validator: val => !val || ['cyan', 'green'].includes(val),
    },
    disableClose: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      colorClass: {
        cyan: this.color === 'cyan',
        green: this.color === 'green',
        disable: this.disableClose,
      },
    };
  },
  computed: {
    cancelFill() {
      return this.disableClose ? `var(--${this.color})` : 'var(--white)';
    },
  },
};
</script>

<style>
.farm-chip {
  display: flex;
  fill: var(--white);
  background: var(--blue);
  color: var(--white);
  border-radius: 1.5rem .5rem .5rem 1.5rem;
  padding: .25rem;
  line-height: .75rem;
  font-size: .75rem;
  font-weight: bold;
  width: fit-content;
}
.green {
  background: var(--green);
}
.farm-chip svg {
  display: inline-block;
}
.farm-chip span {
  padding: .375rem .25rem 0 .25rem;
}
</style>
