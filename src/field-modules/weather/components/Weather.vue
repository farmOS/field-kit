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

    <br>

    <div class="card">
      <div class="card-header">Past weather events</div>
      <div class="card-body">
        <table class="table">
          <tbody>
            <tr>
              <th scope="row">11/15/2019</th>
              <td>1:24 PM</td>
              <td>0.7 in</td>
              <td><icon-raindrops/></td>
            </tr>
            <tr>
              <th scope="row">11/12/2019</th>
              <td>7:08 AM</td>
              <td>3 in</td>
              <td><icon-snowflake/></td>
            </tr>
            <tr>
              <th scope="row">11/5/2019</th>
              <td>10:15 AM</td>
              <td>0.2 in</td>
              <td><icon-raindrops/></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
import IconRaindrops from '@/components/icons/icon-raindrops';
import IconSnowflake from '@/components/icons/icon-snowflake';

export default {
  name: 'Weather',
  components: { IconRaindrops, IconSnowflake },
}
</script>

<style>

</style>