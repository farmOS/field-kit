<template>
  <div class="form-row">
    <div id="date-form" class="form-item form-group col">
      <label for="date" class="control-label">Date</label>
      <input
        id="date"
        type="date"
        :value="time.date"
        @input="updateDate($event.target.value)"
        required
        class="form-control">
    </div>
    <div id="hour-form" class="form-item form-group col">
      <label for="hour" class="control-label">Hour</label>
      <input
        id="hour"
        type="number"
        min="1"
        max="12"
        :value="time.hour"
        @input="updateHour($event.target.value)"
        class="form-control">
    </div>
    <div id="minute-form" class="form-item form-group col">
      <label for="minute" class="control-label">Min</label>
      <input
        id="minute"
        type="number"
        min="00"
        max="59"
        :value="time.minute"
        @input="updateMinute($event.target.value)"
        class="form-control">
    </div>
    <div id="am-pm-form" class="form-item form-group col">
      <label for="am-pm" class="control-label"></label>
      <div id="am-pm" class="form-item form-group">
        <div class="form-check">
          <input
            id="is-am"
            name="am-pm"
            type="radio"
            value="am"
            :checked="time.am"
            @input="updateAmPm($event.target.checked)"
            class="form-check-input">
          <label for="is-am" class="form-check-label">AM</label>
        </div>
        <div class="form-check">
          <input
            id="is-pm"
            name="am-pm"
            type="radio"
            value="pm"
            :checked="!time.am"
            @input="updateAmPm(!$event.target.checked)"
            class="form-check-input">
          <label for="is-pm" class="form-check-label">PM</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const addLeadZero = d => ((d < 10) ? `0${d}` : d);

export default {
  name: 'FarmDateTimeForm',
  props: ['timestamp'],
  data: () => {
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
    this.time.date = this.unixToDateString(this.timestamp);
    const date = new Date(this.timestamp * 1000)
    const hours = date.getHours();
    this.time.hour = (hours === 12 || hours === 24)
      ? 12
      : addLeadZero(hours % 12);
    this.time.minute = addLeadZero(date.getMinutes());
    this.time.am = hours < 12;
  },
  methods: {
    unixToDateString(unixTimestamp) {
      const date = new Date(unixTimestamp * 1000);
      const dateFix = d => ((d < 10) ? `0${d}` : d);
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
      } else {
        hourOutOf24 = +hourOutOf12 + 12;
      }

      if (year > 1970) {
        return Math.floor(new Date(
          year,
          monthIndex,
          day,
          hourOutOf24,
          minute,
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
          this.time.am
        );
        this.$emit('input', timestamp);
      }
    },
    updateHour(hour) {
      const timestamp = this.dateAndTimeToUnix(
        this.time.date,
        hour,
        this.time.minute,
        this.time.am
      );
      this.$emit('input', timestamp);
    },
    updateMinute(minute) {
      const timestamp = this.dateAndTimeToUnix(
        this.time.date,
        this.time.hour,
        minute,
        this.time.am
      );
      this.$emit('input', timestamp);
    },
    updateAmPm(am) {
      const timestamp = this.dateAndTimeToUnix(
        this.time.date,
        this.time.hour,
        this.time.minute,
        am
      );
      this.$emit('input', timestamp);
    },
  },
  watch: {
    timestamp(newTimestamp) {
      this.time.date = this.unixToDateString(newTimestamp);
      const date = new Date(newTimestamp * 1000)
      const hours = date.getHours();
      this.time.hour = (hours === 12 || hours === 24)
        ? 12
        : addLeadZero(hours % 12);
      this.time.minute = addLeadZero(date.getMinutes());
      this.time.am = hours < 12;
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
