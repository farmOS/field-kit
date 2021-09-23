<template lang="html">
  <farm-main>

    <farm-tiles :columns="[1, 2, 3]">
      <farm-card>
        <farm-stack space="s">

          <h3>{{ $t('Date')}}</h3>

          <farm-inline space="s">
            <div>
              <input
                type="radio"
                name="date"
                :value="'TODAY'"
                @input="setDateFilter($event.target.value)"
                :checked="filters.date === 'TODAY'">
              <label
                for="date"
                @click="setDateFilter('TODAY')"
                :class="{selected: filters.date === 'TODAY'}">
                {{ $t('Today')}}
              </label>
            </div>
            <div>
              <input
                type="radio"
                name="date"
                :value="'THIS_WEEK'"
                @input="setDateFilter($event.target.value)"
                :checked="filters.date === 'THIS_WEEK'">
              <label
                for="date"
                @click="setDateFilter('THIS_WEEK')"
                :class="{selected: filters.date === 'THIS_WEEK'}">
                {{ $t('This Week')}}
              </label>
            </div>
            <div>
              <input
                type="radio"
                name="date"
                :value="'THIS_MONTH'"
                @input="setDateFilter($event.target.value)"
                :checked="filters.date === 'THIS_MONTH'">
              <label
                for="date"
                @click="setDateFilter('THIS_MONTH')"
                :class="{selected: filters.date === 'THIS_MONTH'}">
                {{ $t('This Month')}}
              </label>
            </div>
            <div>
              <input
                type="radio"
                name="date"
                :value="'THIS_YEAR'"
                @input="setDateFilter($event.target.value)"
                :checked="filters.date === 'THIS_YEAR'">
              <label
                for="date"
                @click="setDateFilter('THIS_YEAR')"
                :class="{selected: filters.date === 'THIS_YEAR'}">
                {{ $t('This Year')}}
              </label>
            </div>
            <div>
              <input
                type="radio"
                name="date"
                :value="'ALL_TIME'"
                @input="setDateFilter($event.target.value)"
                :checked="filters.date === 'ALL_TIME'">
              <label
                for="date"
                @click="setDateFilter('ALL_TIME')"
                :class="{selected: filters.date === 'ALL_TIME'}">
                {{ $t('All Time')}}
              </label>
            </div>
          </farm-inline>

        </farm-stack>
      </farm-card>

      <farm-card>
        <farm-stack space="s">

          <h3>{{ $t('Log Type')}}</h3>

          <farm-inline space="s">
            <div v-for="type in Object.keys(logTypes)" :key="`type-${type}`">
              <input
                type="checkbox"
                :id="`type-${type}`"
                name="log-types"
                :checked="filters.types[type]"
                @input="$emit('toggle-type-filter', type)">
              <label
                for="log-types"
                @click="$emit('toggle-type-filter', type)"
                :class="{ selected: filters.types[type] }">
                {{ $t(logTypes[type].label) }}
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
  props: ['categories', 'logTypes', 'filters'],
  methods: {
    setDateFilter(value) {
      // TODO: parse date
      this.$emit('set-time-filter', value);
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
