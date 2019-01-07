<template lang="html">
  <div>
    <div class="form-item form-item-name form-group">
      <label for="search" class="control-label">Search</label>
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
  props: ['objects'],
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
      this.$store.dispatch('searchObjects', { objects: this.objects, searchString: val });
    },
  },
}

</script>

<style scoped>

</style>
