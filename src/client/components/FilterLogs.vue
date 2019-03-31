<template lang="html">
  <div class="container-fluid">

    <br>

    <div class="form-item form-group">
      <h4>Date</h4>
      <div class="form-check">
        <input type="radio" name="date">
        <label for="date">Today</label>
      </div>
      <div class="form-check">
        <input type="radio" name="date">
        <label for="date">This Week</label>
      </div>
      <div class="form-check">
        <input type="radio" name="date">
        <label for="date">This Month</label>
      </div>
      <div class="form-check">
        <input type="radio" name="date">
        <label for="date">This Year</label>
      </div>
      <div class="form-check">
        <input type="radio" name="date" checked>
        <label for="date">All Time</label>
      </div>
    </div>

    <div class="form-item form-group">
      <h4>Log Type</h4>
      <div class="form-check">
        <input type="checkbox" name="log-types" value="">
        <label for="log-types">Activity</label>
      </div>
      <div class="form-check">
        <input type="checkbox" name="log-types" value="">
        <label for="log-types">Harvest</label>
      </div>
      <div class="form-check">
        <input type="checkbox" name="log-types" value="">
        <label for="log-types">Input</label>
      </div>
      <div class="form-check">
        <input type="checkbox" name="log-types" value="">
        <label for="log-types">Observation</label>
      </div>
      <div class="form-check">
        <input type="checkbox" name="log-types" value="">
        <label for="log-types">Seeding</label>
      </div>
    </div>

    <div class="form-item form-group">
      <h4>Log Category</h4>
      <div class="form-check" v-for="category in categories">
        <input type="checkbox" name="log-categories">
        <label for="log-categories">{{category.name}}</label>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'FilterLogs',
  props: [ 'categories' ],
}
</script>

<style lang="css" scoped>
</style>
