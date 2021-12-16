<template>
  <div>Tasks</div>
  <p>Status is : {{ tasks.state.isOnline }}</p>
</template>

<script>
import { inject } from 'vue';

export default {
  name: 'Login',
  setup() {
    const tasks = inject('store/tasks');
    export const getHost = () => localStorage.getItem('host');
    return {
      tasks,
    };
  },
};
</script>
