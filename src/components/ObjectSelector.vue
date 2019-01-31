<template lang="html">
  <div>
    <div class="form-item form-item-name form-group">
      <label class="control-label">{{ label }}</label>
      <ul
        class="list-group search-results">
        <li
          v-if="objects.length === 0 && !isWorking"
          class="list-group-item empty">
          <slot name="empty"></slot>
        </li>
        <li
          v-else
          v-for="object in objects"
          class="list-group-item"
          @click="selectObject(object)">
          {{object[objectName]}}
        </li>

      </ul>

    </div>
    <!--
      Displays all objects that have been selected, and provides for deletion
    -->
    <div
    v-for="object in selectedObjects"
    class="form-item form-item-name form-group">
      <label for="type" class="control-label ">{{ object[objectName] }}</label>
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
  /*
    PROPS: The objects are an array of JS objects we are selecting from. The
    objectName is the object field that should be displayed to the user.
    The label is a name for the select field, and workingLabel and isWorking
    are used to set an addiitonal label if objects are still being retrieved.
  */
  props: [
    'objects',
    'objectName',
    'label',
    'isWorking',
  ],
  data() {
    return {
      selectedObjects: [],
    };
  },
  methods: {
    // When results are selected, add them to selectedObjects
    selectObject(object) {
      if (object !== {}) {
        this.selectedObjects = this.selectedObjects.concat(object);
        this.$emit('choices', this.selectedObjects);
      }
    },
    // Remove an object when the remove button is pressed
    removeObject(object) {
      this.selectedObjects = this.selectedObjects.filter(results => results !== object);
      this.$emit('choices', this.selectedObjects);
    },

  },
};

</script>

<style scoped>
  .search-results {
    box-shadow: 2px 2px 5px rgba(0,0,0,.5)
  }
  .search-results li {
    list-style: none;
  }
  .search-results li.is-active,
  .search-results li:hover:not(.empty) {
    background-color: var(--cyan);
    color: white;
  }
</style>
