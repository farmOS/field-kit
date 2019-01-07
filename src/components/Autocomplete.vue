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
              Creates a drop-down menu with all objects that match the search string
              I need to start with a blank value so that the user must always
              select something new and trigger the @input event
            -->
            <option value="">Select an option</option>
            <option v-for="result in searchResults" :value="result.id">{{ result.name }}</option>
        </select>
    </div>
    <div v-for="object in selectedObjects" class="form-item form-item-name form-group">
      <!--
        Displays all objects that have been selected, and provides for deletion
      -->
      <label for="type" class="control-label ">{{ object.name }}</label>
      <button
        :disabled='false'
        title="Remove"
        @click="removeObject(object)"
        type="button"
        class="btn btn-success btn-navbar">
        Remove
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  props: ['objects', 'label'],
  data() {
    return {
      searchResults: [],
      selectedObjects: [],
    }
  },
  methods: {
    //The search method matches partial strings, and is case insensitive
    doSearch(val) {
      let foundObjects = [];
      if(val !== "") {
        const lowerVal = val.toLowerCase();
        for (let i = 0; i < this.objects.length; i++) { // eslint-disable-line no-plusplus
          const object = this.objects[i];
          const lowerName = object.name.toLowerCase();
          if (lowerName.includes(lowerVal)) {
            foundObjects.push({ name: object.name, id: object.id });
          }
        }
      } else {
        foundObjects = this.objects;
      }
      this.searchResults = foundObjects;
    },
    // When results are selected, add them to selectedObjects
    selectSearchResult(id) {
      if(id !== "") {
        const selectedResult = this.searchResults.filter(result => result.id == id);
        this.selectedObjects = this.selectedObjects.concat(selectedResult);
        this.$emit('results', this.selectedObjects);
      }
    },
    // Remove an object when the remove button is pressed
    removeObject(object) {
      this.selectedObjects = this.selectedObjects.filter(results => results !== object);
      this.$emit('results', [this.selectedObjects]);
    }
  },
  beforeMount() {
    this.doSearch("");
  },
}

</script>

<style scoped>

</style>
