<template>
  <farm-card
    class="main-info"
    :breakpoints="breakpoints"
    :boxShadow="_boxShadow">
    <farm-stack space="s">
      <farm-inline space="s">
        <div class="name-container" flex="0 0 calc(100% - 5rem)">
          <h2>{{name}}</h2>
        </div>
        <div class="done-container" flex="0 0 5rem">
          <farm-toggle-check
            :label="done? 'Done' : 'Not Done'"
            labelPosition="above"
            size="large"
            :checked="done"/>
        </div>
      </farm-inline>
      <farm-inline space="s" justifyContent="space-between">
        <div class="timestamp-container" flex="1 1 auto">
          <p>{{timestamp}}</p>
        </div>
        <div class="type-container" flex="1 1 auto">
          <p>{{type}}</p>
        </div>
      </farm-inline>
    </farm-stack>
  </farm-card>
</template>

<script>
import { responsiveProps, mapResponsiveProps } from './responsiveProps';

export default {
  name: 'FarmLogMainInfo',
  mixins: [responsiveProps],
  props: {
    name: {
      type: String,
      required: true,
    },
    done: {
      type: Boolean,
      required: false,
    },
    timestamp: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    breakpoints: {
      type: Array,
      default() {
        return [0, 600, 900];
      },
    },
    boxShadow: {
      type: [String, Array],
      default() {
        return ['none', 'var(--shadow)'];
      },
    },
  },
  computed: {
    ...mapResponsiveProps({
      _boxShadow: 'boxShadow',
    }),
  },
};
</script>

<style scoped>
.main-info {
  border: 1px solid var(--light);
}
.done-container {
  display: flex;
  justify-content: flex-end;
  text-align: center;
  font-size: .75rem;
}
.done-container div {
  flex: 0 0 auto;
}
.timestamp-container p, .type-container p {
  font-size: 1rem;
}
.type-container {
  text-align: right;
  text-transform: uppercase;
}

@media (min-width: 600px) {
  .main-info {
    border: none;
  }
}
</style>
