<template lang="html">
  <div class="form-item form-item-name form-group">
    <label for="search" class="control-label">{{ label }}</label>
    <input
      :value="search"
      placeholder="Enter text to search"
      type="text"
      class="form-control"
      @focus="openResults"
      @input="doSearch($event.target.value)"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter">
    <ul
      v-show="isOpen && search.length > 0"
      class="list-group search-results">
      <li
        v-if="searchResults.length === 0"
        class="list-group-item empty">
        <slot name="empty">No Results</slot>
      </li>
      <li
        v-else
        v-for="(result, i) in searchResults"
        v-bind:key="`result-${i}-${Math.floor(Math.random() * 1000000)}`"
        class="list-group-item"
        :class="{ 'is-active': i === counter }"
        @click="selectSearchResult(result[searchId])">
        {{result[searchKey]}}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'FarmAutocomplete',
  /*
    PROPS: The objects are an array of JS objects we are searching through. The
    searchKey must be provided so we know specifically which property on each
    object we are searching against. The searchId is a unique identifier
    for each object. The label is just a name for the search field
  */
  props: [
    'objects',
    'searchKey',
    'searchId',
    'label',
  ],
  data() {
    return {
      search: '',
      searchResults: [],
      counter: 0,
      isOpen: false,
    };
  },
  methods: {
    openResults() {
      this.isOpen = true;
    },
    // The search method matches partial strings, and is case insensitive
    // Results are limited to a maximum of 10
    doSearch(val) {
      const foundObjects = [];
      if (val !== '') {
        const lowerVal = val.toLowerCase();
        for (let i = 0; i < this.objects.length; i += 1) {
          const object = this.objects[i];
          const lowerName = object.name.toLowerCase();
          if (lowerName.includes(lowerVal) && foundObjects.length < 10) {
            foundObjects.push(object);
          }
        }
      }
      this.searchResults = foundObjects;
      this.search = val;
    },
    // When results are selected, add them to selectedObjects
    selectSearchResult(id) {
      if (id !== '') {
        this.$emit('results', id);
        this.search = '';
        this.doSearch(this.search);
      }
    },
    onArrowDown() {
      if (this.counter < (this.searchResults.length - 1)) {
        this.counter = this.counter + 1;
      }
    },
    onArrowUp(evt) {
      // Use preventDefault so cursor doesn't return to the beginning
      evt.preventDefault();
      if (this.counter > 0) {
        this.counter = this.counter - 1;
      }
    },
    onEnter() {
      const id = this.searchResults[this.counter][this.searchId];
      this.selectSearchResult(id);
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside);
  },
};

</script>

<style scoped>
  .search-results {
    position: absolute;
    z-index: 100;
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

  .invalid input {
    border-color: red;
  }
  .invalid label {
    color: red;
  }
</style>
