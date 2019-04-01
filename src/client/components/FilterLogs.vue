<template lang="html">
  <div class="container-fluid">

    <br>

    <h4>Date</h4>
    <div class="form-item form-group">
      <div class="form-check">
        <input
          type="radio"
          name="date"
          :value="'TODAY'"
          @input="setDateFilter($event.target.value)"
          :checked="logDisplayFilters.date === 'TODAY'">
        <label
          for="date"
          @click="setDateFilter('TODAY')"
          :class="{selected: logDisplayFilters.date === 'TODAY'}">
          Today
        </label>
      </div>
      <div class="form-check">
        <input
          type="radio"
          name="date"
          :value="'THIS_WEEK'"
          @input="setDateFilter($event.target.value)"
          :checked="logDisplayFilters.date === 'THIS_WEEK'">
        <label
          for="date"
          @click="setDateFilter('THIS_WEEK')"
          :class="{selected: logDisplayFilters.date === 'THIS_WEEK'}">
          This Week
        </label>
      </div>
      <div class="form-check">
        <input
          type="radio"
          name="date"
          :value="'THIS_MONTH'"
          @input="setDateFilter($event.target.value)"
          :checked="logDisplayFilters.date === 'THIS_MONTH'">
        <label
          for="date"
          @click="setDateFilter('THIS_MONTH')"
          :class="{selected: logDisplayFilters.date === 'THIS_MONTH'}">
          This Month
        </label>
      </div>
      <div class="form-check">
        <input
          type="radio"
          name="date"
          :value="'THIS_YEAR'"
          @input="setDateFilter($event.target.value)"
          :checked="logDisplayFilters.date === 'THIS_YEAR'">
        <label
          for="date"
          @click="setDateFilter('THIS_YEAR')"
          :class="{selected: logDisplayFilters.date === 'THIS_YEAR'}">
          This Year
        </label>
      </div>
      <div class="form-check">
        <input
          type="radio"
          name="date"
          :value="'ALL_TIME'"
          @input="setDateFilter($event.target.value)"
          :checked="logDisplayFilters.date === 'ALL_TIME'">
        <label
          for="date"
          @click="setDateFilter('ALL_TIME')"
          :class="{selected: logDisplayFilters.date === 'ALL_TIME'}">
          All Time
        </label>
      </div>
    </div>

    <h4>Log Type</h4>
    <div class="form-item form-group">
      <div class="form-check">
        <input
          type="checkbox"
          id="type-farm-activity"
          name="log-types"
          :checked="!logDisplayFilters.excludeTypes.includes('farm_activity')"
          @input="updateExcludeLogType('farm_activity', $event.target.checked)">
        <label
          for="log-types"
          @click="updateExcludeLogType('farm_activity', checkChecked('type-farm-activity'))"
          :class="{selected: !logDisplayFilters.excludeTypes.includes('farm_activity')}">
          Activity
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          id="type-farm-harvest"
          name="log-types"
          :checked="!logDisplayFilters.excludeTypes.includes('farm_harvest')"
          @input="updateExcludeLogType('farm_harvest', $event.target.checked)">
        <label
          for="log-types"
          @click="updateExcludeLogType('farm_harvest', checkChecked('type-farm-harvest'))"
          :class="{selected: !logDisplayFilters.excludeTypes.includes('farm_harvest')}">
          Harvest
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          id="type-farm-input"
          name="log-types"
          :checked="!logDisplayFilters.excludeTypes.includes('farm_input')"
          @input="updateExcludeLogType('farm_input', $event.target.checked)">
        <label
          for="log-types"
          @click="updateExcludeLogType('farm_input', checkChecked('type-farm-input'))"
          :class="{selected: !logDisplayFilters.excludeTypes.includes('farm_input')}">
          Input
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          id="type-farm-observation"
          name="log-types"
          :checked="!logDisplayFilters.excludeTypes.includes('farm_observation')"
          @input="updateExcludeLogType('farm_observation', $event.target.checked)">
        <label
          for="log-types"
          @click="updateExcludeLogType('farm_observation', checkChecked('type-farm-observation'))"
          :class="{selected: !logDisplayFilters.excludeTypes.includes('farm_observation')}">
          Observation
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          id="type-farm-seeding"
          name="log-types"
          :checked="!logDisplayFilters.excludeTypes.includes('farm_seeding')"
          @input="updateExcludeLogType('farm_seeding', $event.target.checked)">
        <label
          for="log-types"
          @click="updateExcludeLogType('farm_seeding', checkChecked('type-farm-seeding'))"
          :class="{selected: !logDisplayFilters.excludeTypes.includes('farm_seeding')}">
          Seeding
        </label>
      </div>
    </div>

    <h4>Log Category</h4>
    <div class="form-item form-group">
      <div class="form-check" v-for="category in categories">
        <input
          type="checkbox"
          :id="`category-${category.tid}`"
          name="log-categories"
          :checked="!logDisplayFilters.excludeCategories.includes(category.tid)"
          @input="updateExcludeLogCategory(category.tid, $event.target.checked)">
        <label
          for="log-categories"
          @click="updateExcludeLogCategory(category.tid, checkChecked(`category-${category.tid}`))"
          :class="{selected: !logDisplayFilters.excludeCategories.includes(category.tid)}">
          {{category.name}}
        </label>
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
    checkChecked(id) {
      return !document.getElementById(id).checked;
    }
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
    margin: .5rem;
    border: solid 2px var(--cyan);
    font-size: 1rem;
    font-weight: bold;
  }

  .selected {
    color: white;
    background-color: var(--cyan);
  }

  input {
    position: absolute;
    opacity: 0;
  }

</style>
