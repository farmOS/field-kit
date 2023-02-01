import FarmDateTimeForm from "../src/components/FarmDateTimeForm.vue";

export default {
  title: "Content/FarmDateTimeForm",
  component: FarmDateTimeForm,
};

export const Base = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmDateTimeForm },
    data() {
      return {
        ts: this.timestamp,
        timestamps: [],
      };
    },
    template: `
      <farm-stack>
        <farm-date-time-form :timestamp="ts" :dateLabel="dateLabel" :id="id" :required="required" @input="e => { ts = e; timestamps.push(e) }"/>
        <farm-list>
          <farm-list-item v-for="(t, i) in timestamps" :key="'timestamp-'+ i">
            {{ (new Date(t)).toLocaleString() }}
          </farm-list-item>
        </farm-list>
      </farm-stack>
    `,
  }),
};

export const withTimestamp = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmDateTimeForm },
    data() {
      return {
        ts: this.timestamp,
        timestamps: [],
      };
    },
    template: `
      <farm-stack>
        <farm-date-time-form :timestamp="ts" :dateLabel="dateLabel" :id="id" :required="required" @input="e => { ts = e; timestamps.push(e) }"/>
        <farm-list>
          <farm-list-item v-for="(t, i) in timestamps" :key="'timestamp-'+ i">
            {{ (new Date(t)).toLocaleString() }}
          </farm-list-item>
        </farm-list>
      </farm-stack>
    `,
  }),

  args: {
    timestamp: new Date().toISOString(),
  },
};

export const withDateLabel = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmDateTimeForm },
    data() {
      return {
        ts: this.timestamp,
        timestamps: [],
      };
    },
    template: `
      <farm-stack>
        <farm-date-time-form :timestamp="ts" :dateLabel="dateLabel" :id="id" :required="required" @input="e => { ts = e; timestamps.push(e) }"/>
        <farm-list>
          <farm-list-item v-for="(t, i) in timestamps" :key="'timestamp-'+ i">
            {{ (new Date(t)).toLocaleString() }}
          </farm-list-item>
        </farm-list>
      </farm-stack>
    `,
  }),

  args: {
    dateLabel: "Start Date",
  },
};
