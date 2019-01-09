<template lang="html">
  <div>
    <div class="form-item form-item-name form-group">
      <label for="search" class="control-label">Add {{ label }} to log</label>
      <input
        @input="doSearch($event.target.value)"
        placeholder="Enter text to search"
        type="text"
        class="form-control"
        autofocus>
    </div>
    <!--
      Displays up to 10 search results
    -->
    <div class="form-item form-item-name form-group">
        <div class="btn-group-vertical">
          <!--
            v-for generates a linting error that is apparently the result of a bug
            https://github.com/vuejs/vetur/issues/261
          -->
          <button type="button"
            v-for="result in searchResults"
            class="btn btn-outline-info btn-block font-weight-bold"
            @click="selectSearchResult(result.id)">
            {{ result.name }}
          </button>
        </div>
    </div>
    <!--
      Displays all objects that have been selected, and provides for deletion
    -->
    <div v-for="object in selectedObjects" class="form-item form-item-name form-group">
      <!--
        v-for generates a linting error that is apparently the result of a bug
        https://github.com/vuejs/vetur/issues/261
      -->
      <label for="type" class="control-label ">{{ object.name }}</label>
      <button
        :disabled='false'
        title="Remove"
        @click="removeObject(object)"
        class="btn btn-danger">
        Remove
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['objects', 'label'],
  data() {
    return {
      searchResults: [],
      selectedObjects: [],
    };
  },
  methods: {
    // The search method matches partial strings, and is case insensitive
    // Results are limited to a maximum of 10
    doSearch(val) {
      const foundObjects = [];
      if (val !== '') {
        const lowerVal = val.toLowerCase();
        for (let i = 0; i < this.objects.length; i++) { // eslint-disable-line no-plusplus
          const object = this.objects[i];
          const lowerName = object.name.toLowerCase();
          if (lowerName.includes(lowerVal) && foundObjects.length < 10) {
            foundObjects.push({ name: object.name, id: object.id });
          }
        }
      }
      this.searchResults = foundObjects;
    },
    // When results are selected, add them to selectedObjects
    selectSearchResult(id) {
      if (id !== '') {
        const selectedResult = this.searchResults.filter(result => result.id == id); // eslint-disable-line eqeqeq
        // eslint prefers strict equivalence, but I need non-strict equivalence here
        this.selectedObjects = this.selectedObjects.concat(selectedResult);
        this.$emit('results', this.selectedObjects);
      }
    },
    // Remove an object when the remove button is pressed
    removeObject(object) {
      this.selectedObjects = this.selectedObjects.filter(results => results !== object);
      this.$emit('results', [this.selectedObjects]);
    },
  },
};

</script>

<style scoped>

</style>
