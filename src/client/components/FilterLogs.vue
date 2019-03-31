<template lang="html">
  <div class="container-fluid">

    <br>

    <div class="form-item form-group">
      <h4>Date</h4>
      <div class="form-check">
        <input
        type="radio"
        name="date"
        :value="'TODAY'"
        @input="setDateFilter($event.target.value)">
        <label for="date">Today</label>
      </div>
      <div class="form-check">
        <input
        type="radio"
        name="date"
        :value="'THIS_WEEK'"
        @input="setDateFilter($event.target.value)">
        <label for="date">This Week</label>
      </div>
      <div class="form-check">
        <input
        type="radio"
        name="date"
        :value="'THIS_MONTH'"
        @input="setDateFilter($event.target.value)">
        <label for="date">This Month</label>
      </div>
      <div class="form-check">
        <input
        type="radio"
        name="date"
        :value="'THIS_YEAR'"
        @input="setDateFilter($event.target.value)">
        <label for="date">This Year</label>
      </div>
      <div class="form-check">
        <input
        type="radio"
        name="date"
        :value="'ALL_TIME'"
        @input="setDateFilter($event.target.value)"
        checked>
        <label for="date">All Time</label>
      </div>
    </div>

    <div class="form-item form-group">
      <h4>Log Type</h4>
      <div class="form-check">
        <input
          type="checkbox"
          name="log-types"
          :checked="!logDisplayFilters.excludeTypes.includes('farm_activity')"
          @input="updateExcludeLogType('farm_activity', $event.target.checked)">
        <label for="log-types">Activity</label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          name="log-types"
          :checked="!logDisplayFilters.excludeTypes.includes('farm_harvest')"
          @input="updateExcludeLogType('farm_harvest', $event.target.checked)">
        <label for="log-types">Harvest</label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          name="log-types"
          :checked="!logDisplayFilters.excludeTypes.includes('farm_input')"
          @input="updateExcludeLogType('farm_input', $event.target.checked)">
        <label for="log-types">Input</label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          name="log-types"
          :checked="!logDisplayFilters.excludeTypes.includes('farm_observation')"
          @input="updateExcludeLogType('farm_observation', $event.target.checked)">
        <label for="log-types">Observation</label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          name="log-types"
          :checked="!logDisplayFilters.excludeTypes.includes('farm_seeding')"
          @input="updateExcludeLogType('farm_seeding', $event.target.checked)">
        <label for="log-types">Seeding</label>
      </div>
    </div>

    <div class="form-item form-group">
      <h4>Log Category</h4>
      <div class="form-check" v-for="category in categories">
        <input
          type="checkbox"
          name="log-categories"
          :checked="!logDisplayFilters.excludeCategories.includes(category.tid)"
          @input="updateExcludeLogCategory(category.tid, $event.target.checked)">
        <label for="log-categories">{{category.name}}</label>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'FilterLogs',
  props: [ 'categories', 'logDisplayFilters' ],
  methods: {
    updateExcludeLogType(type, checked) {
      if (!checked) {
        this.$store.commit('addToExcludeTypes', type);
        return;
      }
      this.$store.commit('removeFromExcludeTypes', type);
      return;
    },
    updateExcludeLogCategory(type, checked) {
      if (!checked) {
        this.$store.commit('addToExcludeCategories', type);
        return;
      }
      this.$store.commit('removeFromExcludeCategories', type);
      return;
    },
    setDateFilter(value) {
      this.$store.commit('setDateFilter', value);
    },
  },
};
</script>

<style lang="css" scoped>
</style>
