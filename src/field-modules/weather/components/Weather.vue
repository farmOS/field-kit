<template>
  <div class="container-fluid">
    <br>
    <div class="card" v-if="currentLogID !== null">
      <div class="card-header">Record a weather event</div>
      <div class="card-body">

        <date-and-time-form
          :timestamp="currentLog.timestamp"
          @input="updateCurrentLog('timestamp', $event)"/>

        <div class="form-row">
          <div class="form-item form-group col">
            <label for="precip-amt" class="control-label">
              Precipitation amount ({{unitAbbr}})
            </label>
            <input
              id="precip-amt"
              type="number"
              min="0"
              :value="currentLog.quantity[0].value"
              @input="updateQuantity('value', $event.target.value)"
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
                  :checked="currentLog.quantity[0].label === 'rain'"
                  @input="updateQuantity('label', $event ? 'rain' : 'snow')"
                  class="form-check-input">
                <label for="precip-type-rain" class="form-check-label">Rain</label>
              </div>
              <div class="form-check">
                <input
                  id="precip-type-snow"
                  name="precip-type"
                  type="radio"
                  value="snow"
                  :checked="currentLog.quantity[0].label === 'snow'"
                  @input="updateQuantity('label', $event ? 'snow' : 'rain')"
                  class="form-check-input">
                <label for="precip-type-snow" class="form-check-label">Snow</label>
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-item form-group col">
            <label for="notes" class="control-label">Notes</label>
            <textarea
              id="notes"
              :value="parseNotes(currentLog.notes)"
              @input="updateNotes($event.target.value)"
              placeholder="Enter notes"
              class="form-textarea form-control">
            </textarea>
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
              <td colspan="4" @click="createWeatherLog">
                <div class="add-wrapper"><icon-add-circle/></div>
                <em>&nbsp;Add a new weather event.</em>
              </td>
            </tr>
            <tr v-for="log in logs" :key="`log-${log.localID}`" @click="currentLogID = log.localID">
              <th scope="row">
                {{
                  new Date(log.timestamp * 1000)
                    .toLocaleDateString(undefined, { dateStyle: 'medium' })
                }}
              </th>
              <td>
                {{
                  new Date(log.timestamp * 1000)
                    .toLocaleTimeString(undefined, { timeStyle: 'short' })
                }}
              </td>
              <td>{{`${log.quantity[0].value} ${unitAbbr}`}}</td>
              <td v-if="log.quantity[0].label === 'snow'"><icon-snowflake/></td>
              <td v-if="log.quantity[0].label === 'rain'"><icon-raindrops/></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
import parseNotes from '@/utils/parseNotes';
import DateAndTimeForm from '@/components/DateAndTimeForm';
import IconAddCircle from '@/components/icons/icon-add-circle';
import IconRaindrops from '@/components/icons/icon-raindrops';
import IconSnowflake from '@/components/icons/icon-snowflake';

export default {
  name: 'Weather',
  components: {
    DateAndTimeForm,
    IconAddCircle,
    IconRaindrops,
    IconSnowflake,
  },
  data: () => ({
    currentLogID: null,
    time: {
      date: null,
      hour: null,
      minute: null,
      am: true,
    },
  }),
  props: ['logs', 'units', 'categories', 'systemOfMeasurement'],
  created() {
    this.$store.dispatch('updateUnits');
    this.$store.dispatch('updateCategories');
  },
  computed: {
    currentLog() { return this.logs.find(l => l.localID === this.currentLogID); },
    weatherTid() { return this.categories.find(cat => cat.name === 'Weather').tid; },
    unitName() { return this.systemOfMeasurement === 'us' ? 'inches' : 'centimeters'; },
    unitAbbr() { return this.systemOfMeasurement === 'us' ? 'in' : 'cm'; },
    unitTid() { return this.units.find(u => u.name === this.unitName).tid; },
  },
  methods: {
    createWeatherLog() {
      this.$store.dispatch('initializeLog', {
        type: 'farm_observation',
        log_category: [{ id: this.weatherTid }],
        quantity: [{
          measure: 'length',
          value: 0,
          unit: { id: this.unitTid },
          label: 'rain',
        }],
        done: true,
      }).then((id) => { this.currentLogID = id; });
    },
    updateCurrentLog(key, val) {
      const props = {
        [key]: val,
        localID: this.currentLogID,
      };
      this.$store.dispatch('updateLog', { props });
    },
    updateNotes(value) {
      this.updateCurrentLog('notes', { value, format: 'farm_format' });
    },
    updateQuantity(key, val) {
      const quantity = [{
        ...this.currentLog.quantity[0],
        [key]: val,
      }];
      this.updateCurrentLog('quantity', quantity);
    },
    unixToDateString(unixTimestamp) {
      const date = new Date(unixTimestamp * 1000);
      const dateFix = d => ((d < 10) ? `0${d}` : d);
      const mm = dateFix(date.getMonth() + 1);
      const dd = dateFix(date.getDate());
      return `${date.getFullYear()}-${mm}-${dd}`;
    },
    dateStringToUnix(nonUnixTimestamp) {
      const year = +nonUnixTimestamp.split('-')[0];
      const monthIndex = +nonUnixTimestamp.split('-')[1] - 1;
      const date = +nonUnixTimestamp.split('-')[2];
      return Math.floor(new Date(year, monthIndex, date).getTime() / 1000).toString();
    },
    parseNotes,
  },
};
</script>

<style>
  table svg {
    height: 1.25rem;
  }

  .add-wrapper {
    display: inline-block;
    vertical-align: bottom;
  }

  .add-wrapper svg {
    display: block;
  }

  #date-form {
    flex: 1 1 30%;
  }

  #hour-form, #minute-form, #am-pm-form {
    flex: 1 1 3rem;
  }

</style>
