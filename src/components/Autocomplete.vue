<template lang="html">
  <div>
    <p>{{ searchResults }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  data() {
    return {
      displayText: "The component is in.",
    }
  },
  computed: mapState({
    searchResults: state => state.farm.searchResults,
  }),
  methods: {
    printLogs() {

    },
  },
}

</script>

<style scoped>

</style>
