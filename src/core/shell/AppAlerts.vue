<template v-if="errors.length < 0">
  <div class="alerts">
    <div
      class="alert alert-warning alert-dismissable"
      v-for="(err, index) in errors"
      :key="`alert-${index}`">
      <span v-html="err.message"></span>
      <button
        type="button"
        @click="dismissAlert(index)"
        class="close"
        aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
</template>

<script>
import errors, { dismissAlert } from '../store/errors';

export default {
  name: 'AppAlerts',
  data() {
    return { errors };
  },
  methods: {
    dismissAlert,
  },
};
</script>

<style scoped>

  .alerts {
    position: absolute;
    z-index: 1001;
    bottom: var(--s);
    right: var(--s);
    left: var(--s);
    text-align: center;
  }

  .alert {
    display: inline-block;
    box-shadow: var(--shadow-strong);
  }

  .close {
    position: absolute;
    top: 5px;
    right: 5px;
  }

</style>
