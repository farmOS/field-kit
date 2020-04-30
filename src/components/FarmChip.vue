<template>
  <div class="farm-chip" :class="colorClass">
    <icon-cancel/>
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
  },
  data() {
    return {
      colorClass: {
        cyan: this.color === 'cyan',
        green: this.color === 'green',
      },
    };
  },
};
</script>

<style>
.farm-chip {
  display: flex;
  fill: white;
  background: var(--cyan);
  color: white;
  border-radius: 1.5rem .5rem .5rem 1.5rem;
  padding: .25rem;
  line-height: .75rem;
  font-size: .75rem;
  font-weight: bold;
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
