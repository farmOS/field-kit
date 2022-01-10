<template>
  <div class="farm-autocomplete form-item form-item-name form-group">
    <label for="search" class="control-label">{{ label }}</label>
    <input
      :value="query"
      :placeholder="$t('Enter text to search')"
      type="text"
      class="form-control"
      @focus="openResults"
      @input="runSearch"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter">
    <ul
      v-show="isOpen && query.length >= minLength"
      class="list-group search-results">
      <li
        v-if="matches.length === 0"
        class="list-group-item empty">
        <slot name="empty">{{ $t('No Results')}}</slot>
      </li>
      <li
        v-else
        v-for="({ item, key, index }, i) in matches"
        :key="`result-${i}`"
        class="list-group-item"
        :class="{ 'is-active': i === counter }"
        @click="select(index)">
        {{item[key]}}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'FarmAutocomplete',
  props: {
    list: {
      validator(l) {
        return Array.isArray(l) && l.every(o => typeof o === 'object');
      },
    },
    keys: {
      validator(ks) {
        return Array.isArray(ks)
          && ks.every(k => typeof k === 'string' || typeof k === 'symbol');
      },
    },
    // Minimum # of characters in the query string before search is performed.
    minLength: {
      type: Number,
      default: 1,
    },
    caseSensitive: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      query: '',
      matches: [],
      primaryKey: this.keys[0],
      counter: 0,
      isOpen: false,
    };
  },
  methods: {
    openResults() {
      this.isOpen = true;
    },
    runSearch(e) {
      this.query = e.target.value;
      if (this.query.length >= this.minLength) {
        const fmt = str => (this.caseSensitive ? str : str.toLowerCase());
        this.matches = this.list.reduce((matches, item, index) => {
          const matchingKeys = this.keys.filter(k => fmt(item[k]).includes(fmt(this.query)));
          if (matchingKeys.length > 0) {
            const key = matchingKeys.includes(this.primaryKey)
              ? this.primaryKey
              : matchingKeys[0];
            const match = { item, index, key };
            return [...matches, match];
          }
          return matches;
        }, []);
      }
    },
    select(index) {
      this.$emit('select', index);
      this.query = '';
    },
    onArrowDown() {
      if (this.counter < (this.matches.length - 1)) {
        this.counter += 1;
      }
    },
    onArrowUp(evt) {
      // Use preventDefault so cursor doesn't return to the beginning
      evt.preventDefault();
      if (this.counter > 0) {
        this.counter -= 1;
      }
    },
    onEnter() {
      const { index } = this.matches[this.counter];
      this.select(index);
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
    box-shadow: var(--shadow)
  }
  .search-results li {
    list-style: none;
  }
  .search-results li.is-active,
  .search-results li:hover:not(.empty) {
    background-color: var(--blue);
    color: var(--white);
  }

  .invalid input {
    border-color: var(--red);
  }
  .invalid label {
    color: var(--red);
  }
</style>
