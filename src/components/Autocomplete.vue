<template lang="html">
  <div>
    <div class="form-item form-item-name form-group">
      <label for="search" class="control-label">Find {{ label }}</label>
      <input
        @input="doSearch($event.target.value)"
        placeholder="Enter search string"
        type="text"
        class="form-control"
        autofocus>
    </div>
    <div class="form-item form-item-name form-group">
      <label for="type" class="control-label ">Add {{ label }} to log</label>
        <select
          @input="selectSearchResult($event.target.value)"
          class="custom-select col-sm-3 ">
            <!--
              I need to start with a blank value so that the user must always
              select something new and trigger the @input event
            -->
            <option value="">Select an option</option>
            <option v-for="result in searchResults" :value="result.id">{{ result.name }}</option>
        </select>
    </div>
    <p>{{ logs[currentLogIndex].field_farm_asset }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  props: ['objects', 'label'],
  data() {
    return {
      searchResults: [],
    }
  },
  computed: mapState({
    logs: state => state.farm.logs,
    currentLogIndex: state => state.farm.currentLogIndex,
  }),
  methods: {
    doSearch(val) {
      if(val !== undefined) {
        const lowerVal = val.toLowerCase();
        const foundObjects = [];
        for (let i = 0; i < this.objects.length; i++) { // eslint-disable-line no-plusplus
          const object = this.objects[i];
          const lowerName = object.name.toLowerCase();
          if (lowerName.includes(lowerVal)) {
            foundObjects.push({ name: object.name, id: object.id });
          }
        }
        this.searchResults = foundObjects;
      }
    },
    selectSearchResult(id) {
      if(id !== "") {
        const selectedResult = this.searchResults.filter(result => result.id == id);
        this.$emit('results', selectedResult);
      }
    },
  },
}

</script>

<style scoped>

</style>
