<template>
  <div class="farm-date-time-form form-row">
    <div :id="id + '-date-form'" class="form-item form-group col">
      <label :for="id + '-date'" class="control-label">{{ dateLabel }}</label>
      <input
        :id="id + '-date'"
        type="date"
        :value="time.date"
        @input="updateDate($event.target.value)"
        required
        class="form-control">
    </div>
    <div :id="id + '-hour-form'" class="form-item form-group col">
      <label :for="id + '-hour'" class="control-label">Hour</label>
      <input
        :id="id + '-hour'"
        type="number"
        min="1"
        max="12"
        :value="time.hour"
        @input="updateHour($event.target.value)"
        @blur="updateHour($event.target.value, true)"
        class="form-control">
    </div>
    <div :id="id + '-minute-form'" class="form-item form-group col">
      <label :for="id + '-minute'" class="control-label">Min</label>
      <input
        :id="id + '-minute'"
        type="number"
        min="00"
        max="59"
        :value="time.minute"
        @input="updateMinute($event.target.value)"
        @blur="updateMinute($event.target.value, true)"
        class="form-control">
    </div>
    <div :id="id + '-am-pm-form'" class="form-item form-group col">
      <label :for="id + '-am-pm'" class="control-label"></label>
      <div :id="id + '-am-pm'" class="form-item form-group">
        <div class="form-check">
          <input
            :id="id + '-is-am'"
            :name="id + '-am-pm'"
            type="radio"
            value="am"
            :checked="time.am"
            @input="updateAmPm($event.target.checked)"
            class="form-check-input">
          <label :for="id + '-is-am'" class="form-check-label">AM</label>
        </div>
        <div class="form-check">
          <input
            :id="id + '-is-pm'"
            :name="id + '-am-pm'"
            type="radio"
            value="pm"
            :checked="!time.am"
            @input="updateAmPm(!$event.target.checked)"
            class="form-check-input">
          <label :for="id + '-is-pm'" class="form-check-label">PM</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const addLeadZero = d => ((d < 10) ? `0${d}` : d);

export default {
  name: 'FarmDateTimeForm',
  props: {
    timestamp: {
      default: '',
    },
    dateLabel: {
      default: 'Date',
      type: String,
    },
    id: {
      default: 'date',
      type: String,
    },
  },
  data() {
    return {
      time: {
        date: '',
        hour: '12',
        minute: '00',
        am: true,
      },
    };
  },
  created() {
    this.updateInputFields(this.timestamp);
  },
  methods: {
    updateInputFields(timestamp) {
      if (!timestamp) {
        this.time.date = '';
        this.time.hour = '';
        this.time.minute = '';
        this.time.am = '';
        return;
      }
      this.time.date = this.unixToDateString(timestamp);
      const date = new Date(timestamp * 1000);
      const hours = date.getHours();
      this.time.hour = (hours === 0 || hours === 12)
        ? 12
        : addLeadZero(hours % 12);
      this.time.minute = addLeadZero(date.getMinutes());
      this.time.am = hours < 12;
    },
    unixToDateString(unixTimestamp) {
      const date = new Date(unixTimestamp * 1000);
      const mm = addLeadZero(date.getMonth() + 1);
      const dd = addLeadZero(date.getDate());
      return `${date.getFullYear()}-${mm}-${dd}`;
    },
    dateAndTimeToUnix(dateString, hourOutOf12, minute, am) {
      const year = +dateString.split('-')[0];
      const monthIndex = +dateString.split('-')[1] - 1;
      const day = +dateString.split('-')[2];

      let hourOutOf24;
      if (am && +hourOutOf12 === 12) {
        hourOutOf24 = 0;
      } else if (am || +hourOutOf12 === 12) {
        hourOutOf24 = +hourOutOf12;
      } else if (
        Number.isInteger(+hourOutOf12)
        && +hourOutOf12 > 0
        && +hourOutOf12 < 12) {
        hourOutOf24 = +hourOutOf12 + 12;
      } else {
        hourOutOf24 = 0;
      }

      const validMinute = Number.isInteger(+minute)
        && +minute >= 0
        && +minute < 60
        ? minute
        : 0;

      if (year > 1970) {
        return Math.floor(new Date(
          year,
          monthIndex,
          day,
          hourOutOf24,
          validMinute,
        ).getTime() / 1000).toString();
      }
      return (this.timestamp).toString();
    },
    updateDate(dateString) {
      if (dateString) {
        const timestamp = this.dateAndTimeToUnix(
          dateString,
          this.time.hour,
          this.time.minute,
          this.time.am,
        );
        this.$emit('input', timestamp);
      }
    },
    updateHour(hour, skipValidation = false) {
      if (hour.length === 2 || skipValidation) {
        const timestamp = this.dateAndTimeToUnix(
          this.time.date,
          hour,
          this.time.minute,
          this.time.am,
        );
        this.$emit('input', timestamp);
      }
    },
    updateMinute(minute, skipValidation = false) {
      if (minute.length === 2 || skipValidation) {
        const timestamp = this.dateAndTimeToUnix(
          this.time.date,
          this.time.hour,
          minute,
          this.time.am,
        );
        this.$emit('input', timestamp);
      }
    },
    updateAmPm(am) {
      const timestamp = this.dateAndTimeToUnix(
        this.time.date,
        this.time.hour,
        this.time.minute,
        am,
      );
      this.$emit('input', timestamp);
    },
  },
  watch: {
    timestamp(newTimestamp) {
      this.updateInputFields(newTimestamp);
    },
  },
};
</script>

<style>
  #date-form {
    flex: 1 1 30%;
  }

  #hour-form, #minute-form, #am-pm-form {
    flex: 1 1 3rem;
  }
</style>
