<template>
  <farm-card
    class="main-info"
    :breakpoints="breakpoints"
    :boxShadow="_boxShadow">
    <farm-stack space="1rem">
      <farm-inline space="1rem">
        <div class="name-container" flex="0 0 calc(100% - 5rem)">
          <h3>{{name}}</h3>
        </div>
        <div class="done-container" flex="0 0 5rem">
          <farm-toggle-check
            :label="done? 'Done' : 'Not Done'"
            labelPosition="above"
            size="large"
            :checked="done"/>
        </div>
      </farm-inline>
      <farm-inline space="1rem" justifyContent="space-between">
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
      // TODO: Make this type a Number (Unix timestamp) and compute a string.
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
        return ['none', '1px 2px 3px rgba(0, 0, 0, 0.25)'];
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
  border: 1px solid #eee;
}
h3, p {
  margin-bottom: 0;
}

.name-container h3 {
  font-size: 1.5rem;
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
