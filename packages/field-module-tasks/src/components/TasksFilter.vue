<template>
  <farm-main>
    <app-bar-options :title="$t('Log Filters')" nav="back" :actions="appBarActions"/>
    <farm-tiles :columns="[1, 2, 3]">

      <farm-card>
        <farm-stack space="s">
          <h3>{{ $t('Log Type')}}</h3>
          <farm-inline space="s">
            <div v-for="t in Object.keys(logTypes)" :key="`type-${t}`">
              <input
                type="checkbox"
                :id="`type-${t}`"
                name="log-types"
                :checked="filters.types[t]"
                @input="$emit('toggle-type-filter', t)">
              <label
                for="log-types"
                @click="$emit('toggle-type-filter', t)"
                :class="{ selected: filters.types[t] }">
                {{ $t(logTypes[t].label) }}
              </label>
            </div>
          </farm-inline>
        </farm-stack>
      </farm-card>

      <farm-card>
        <farm-stack space="s">
          <h3>{{ $t('Log Category')}}</h3>
          <farm-inline space="s">
            <div>
              <input
                type="checkbox"
                id="category-none"
                name="log-categories"
                :checked="filters.categories.NO_CATEGORY"
                @input="$emit('toggle-category-filter', 'NO_CATEGORY')">
              <label
                for="log-categories"
                @click="$emit('toggle-category-filter', 'NO_CATEGORY')"
                :class="{selected: filters.categories.NO_CATEGORY}">
                {{ $t('No Category')}}
              </label>
            </div>
            <div v-for="category in categories" :key="`category-${category.id}`">
              <input
                type="checkbox"
                :id="`category-${category.id}`"
                name="log-categories"
                :checked="filters.categories[category.id]"
                @input="$emit('toggle-category-filter', category.id)">
              <label
                for="log-categories"
                @click="$emit('toggle-category-filter', category.id)"
                :class="{selected: filters.categories[category.id]}">
                {{category.name}}
              </label>
            </div>
          </farm-inline>
        </farm-stack>
      </farm-card>

    </farm-tiles>

  </farm-main>
</template>
<script>
export default {
  name: 'TasksFilter',
  emits: ['reset-filters', 'toggle-category-filter', 'toggle-type-filter'],
  props: ['categories', 'logTypes', 'filters'],
  methods: {
    reset() {
      this.$emit('reset-filters');
    },
  },
  computed: {
    appBarActions() {
      return [
        {
          icon: 'icon-filter-off',
          onClick: this.reset,
          text: this.$t('Reset filters'),
        },
      ];
    },
  },
};
</script>
<style lang="css" scoped>
  .form-group {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    margin: 1rem;
  }

  .form-check {
    padding: 0;
  }

  label {
    padding: 1rem;
    border: solid 2px var(--blue);
    font-size: 1rem;
    font-weight: bold;
  }

  .selected {
    color: var(--white);
    background-color: var(--blue);
  }

  input {
    position: absolute;
    opacity: 0;
  }

</style>
