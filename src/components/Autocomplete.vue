<template lang="html">
  <div>
    <div class="form-item form-item-name form-group">
      <label for="search" class="control-label">Find {{ type }}</label>
      <input
        @input="enterSearchString($event.target.value)"
        placeholder="Enter search string"
        type="text"
        class="form-control"
        autofocus>
    </div>
    <p>{{ searchResults }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  props: ['type'],
  data() {
    return {
      displayText: "The component is in.",
    }
  },
  computed: mapState({
    searchResults: state => state.farm.searchResults,
  }),
  methods: {
    enterSearchString(val) {
      this.$store.dispatch('searchAssets', {type:this.type, searchString:val});
    },
  },
}

</script>

<style scoped>

</style>
