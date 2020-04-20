<template>
  <farm-card
    class="main-info"
    :breakpoints="breakpoints"
    :boxShadow="_boxShadow">
    <farm-row space="1rem">
      <div class="name-container">
        <h3>{{name}}</h3>
      </div>
      <div class="done-container">
        <farm-toggle-check
          :label="done? 'Done' : 'Not Done'"
          labelPosition="above"
          size="large"
          :checked="done"/>
      </div>
    </farm-row>
    <farm-row space="1rem">
      <div class="timestamp-container">
        <p>{{timestamp}}</p>
      </div>
      <div class="type-container">
        <p>{{type}}</p>
      </div>
    </farm-row>
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

.name-container {
  flex: 0 0 80%;
}
.name-container h3 {
  font-size: 1.5rem;
}
.done-container {
  display: flex;
  justify-content: flex-end;
  flex: 0 0 20%;
  text-align: center;
  font-size: .75rem;
}
.done-container div {
  flex: 0 0 auto;
}
.timestamp-container, .type-container {
  flex: 1 1 auto;
}
.timestamp-container p, .type-container p {
  font-size: 1rem;
}
.type-container {
  flex: 0 0 20%;
  text-align: right;
  text-transform: uppercase;
}

@media (min-width: 600px) {
  .main-info {
    border: none;
  }
}
</style>
