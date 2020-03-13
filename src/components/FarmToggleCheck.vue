<template lang="html">
  <div>
    <label v-if="label && labelPosition=== 'before'">{{ label }}&nbsp;</label>
    <input
      class="toggle-check"
      type="checkbox"
      :checked="checked"
      @input="$emit('input', $event.target.checked)"/>
    <label v-if="label && labelPosition=== 'after'">{{ label }}&nbsp;</label>
  </div>
</template>

<script>
export default {
  name: 'FarmToggleCheck',
  props: ['label', 'labelPosition', 'checked']
}
</script>

<style lang="css" scoped>
  input.toggle-check {
    position: relative;
    -webkit-appearance: none;
    outline: none;
    width: 1.6667rem;
    height: 1rem;
    background-color: #fff;
    border: 1px solid #D9DADC;
    border-radius: 1.6667rem;
    box-shadow: inset -0.6667rem 0 0 0 #fff;
  }

  input.toggle-check:after {
    content: "";
    position: absolute;
    top: 1px;
    left: 1px;
    background: transparent;
    width: 0.8667rem;
    height: 0.8667rem;
    border-radius: 50%;
    box-shadow: 1px 0px 2px rgba(0,0,0,0.2);
  }

  input.toggle-check:checked {
    box-shadow: inset 0.6667rem 0 0 0 var(--cyan);
    border-color: var(--cyan);
  }

  input.toggle-check:checked:after {
    left: 0.6667rem;
    box-shadow: -1px 0px 2px rgba(0,0,0,0.05);
  }
</style>
