<template lang="html">
  <div class="farm-select-box form-check">
    <input
      type="checkbox"
      :id="id"
      :name="id"
      :checked="selected">
    <label
      :for="id"
      @click="$emit('input', checkChecked())"
      :class="[{selected: selected}, {small: small}]">
      {{label}}
    </label>
  </div>
</template>

<script>
export default {
  name: 'FarmSelectBox',
  props: {
    id: String,
    selected: Boolean,
    label: String,
    small: Boolean,
  },
  methods: {
    checkChecked() {
      return !document.getElementById(this.id).checked;
    },
  },
};
</script>

<style lang="css" scoped>
  .form-check {
    padding: 0;
  }

  input {
    position: absolute;
    left: -10000px;
    opacity: 0;
  }

  label {
    padding: 1rem;
    margin: .5rem;
    border: solid 2px var(--cyan);
    font-size: 1rem;
    font-weight: bold;
  }

  label.small {
    padding: .5rem;
    font-size: .875rem;
    margin: .25rem;
  }

  .selected {
    color: white;
    background-color: var(--cyan);
  }
</style>
