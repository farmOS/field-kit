<template lang="html">
  <div class="form-check">
    <input
      type="checkbox"
      :id="id"
      :name="id"
      :checked="selected">
    <label
      :for="id"
      @click="$emit('input', checkChecked(id))"
      :class="{selected: selected}">
      {{label}}
    </label>
  </div>
</template>

<script>
export default {
  props: [
    'id',
    'selected',
    'label'
  ],
  methods: {
    checkChecked(id) {
      return !document.getElementById(this.id).checked;
    },
  },
}
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

  .selected {
    color: white;
    background-color: var(--cyan);
  }
</style>
