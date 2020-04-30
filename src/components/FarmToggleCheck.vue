<template lang="html">
  <div class="farm-toggle-check">
    <label
      v-if="label && ['above', 'before'].includes(labelPosition)"
      :class="{ above: labelPosition === 'above' }">
      {{ label }}&nbsp;
    </label>
    <input
      class="toggle-check"
      :class="{ large: size === 'large' }"
      type="checkbox"
      :checked="checked"
      @input="$emit('input', $event.target.checked)"/>
    <label
      v-if="label && ['after', 'below'].includes(labelPosition)"
      :class="{ below: labelPosition === 'below' }">
      {{ label }}&nbsp;
    </label>
  </div>
</template>

<script>
export default {
  name: 'FarmToggleCheck',
  props: {
    label: {
      type: String,
      required: false,
    },
    labelPosition: {
      validator: val => !val || ['above', 'after', 'before', 'below'].includes(val),
    },
    checked: {
      type: Boolean,
      required: true,
    },
    size: {
      validator: val => !val || ['small', 'large'].includes(val),
    },
  },
};
</script>

<style lang="css" scoped>
  label.above, label.below {
    display: block;
    margin-bottom: .25rem;
  }

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

  input.toggle-check.large {
    height: 2rem;
    width: 3.3333rem;
  }

  input.toggle-check.large:after {
    height: 1.7333rem;
    width: 1.7333rem;
  }

  input.toggle-check.large:checked {
    box-shadow: inset 1.3333rem 0 0 0 var(--cyan);
    border-color: var(--cyan);
  }

  input.toggle-check.large:checked:after {
    left: 1.3333
  }
</style>
