<template lang="html">
  <!-- <h1>All Observations</h1> -->
  <ul>
    <li
      v-for="log in logs"
      :key='logs.indexOf(log)'
    >
      <!-- Added structure to the display of logs to fix an iOS-only bug.
      For some reason, iOS messes up the display of unstructured logs
      when fields are updated. -->
      <div class="well">
        <ul>
          <li
            v-for='(value, key) in log'
            :key='key'
          >
            {{key}}: {{value}}
          </li>
        </ul>
      </div>
    </li>
  </ul>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: mapState({
    logs: state => state.farm.logs,
    currentLogIndex: state => state.farm.currentLogIndex,
    isWorking: state => state.farm.isWorking,
    statusText: state => state.farm.statusText,
    photoLoc: state => state.farm.photoLoc,
    isOnline: state => state.user.isOnline,
  }),
};
</script>

<style scoped>
</style>
