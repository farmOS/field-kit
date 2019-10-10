<template>
  <div class="container-fluid">
    <br>
    <div class="card">
      <div class="card-header">Record a weather event</div>
      <div class="card-body">

        <div class="form-row">
          <div class="form-item form-group col">
            <label for="date" class="control-label">Date</label>
            <input
              id="date"
              type="date"
              class="form-control">
          </div>
          <div class="form-item form-group col">
            <label for="hour" class="control-label">Hour</label>
            <input
              id="hour"
              type="number"
              min="0"
              max="23"
              value="0"
              class="form-control">
          </div>
          <div class="form-item form-group col">
            <label for="minute" class="control-label">Minute</label>
            <input
              id="minute"
              type="number"
              min="0"
              max="59"
              value="0"
              class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-item form-group col">
            <label for="precip-amt" class="control-label">Precipitation amount (cm)</label>
            <input 
              id="precip-amt"
              type="number"
              min="0"
              value="0"
              class="form-control">
          </div>
          <div class="form-item form-group col">
            <label for="precip-type" class="control-label">Precipitation Type</label>
            <div id="precip-type" class="form-item form-group">
              <div class="form-check">
                <input 
                  id="precip-type-rain"
                  name="precip-type"
                  type="radio"
                  value="rain"
                  class="form-check-input">
                <label for="precip-type-rain" class="form-check-label">Rain</label>
              </div>
              <div class="form-check">
                <input 
                  id="precip-type-snow"
                  name="precip-type"
                  type="radio"
                  value="snow"
                  class="form-check-input">
                <label for="precip-type-snow" class="form-check-label">Snow</label>
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-item form-group col">
            <label for="notes" class="control-label">Notes</label>
            <textarea id="notes" class="form-textarea form-control"></textarea>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Weather',
}
</script>

<style>

</style>