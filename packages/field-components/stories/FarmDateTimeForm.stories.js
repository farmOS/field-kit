import FarmDateTimeForm from '../src/components/FarmDateTimeForm.vue';

export default {
  title: 'Content/FarmDateTimeForm',
  component: FarmDateTimeForm,
  argTypes: {
    timestamp: {
      control: 'date',
    },
    dateLabel: {
      control: 'string',
      options: ['Date', 'Start Date', 'End Date'],
    },
    id: {
      control: 'string',
    },
    required: {
      control: 'boolean',
    },
  },
  render: args => ({
    setup() { return args; },
    data() {
      return {
        ts: this.timestamp,
        timestamps: [],
      };
    },
    template: `
      <farm-stack>
        <farm-date-time-form
          :timestamp="ts"
          :dateLabel="dateLabel"
          :id="id"
          :required="required"
          @input="e => { ts = e; timestamps.push(e) }"/>
        <farm-list>
          <farm-list-item v-for="(t, i) in timestamps" :key="'timestamp-'+ i">
            {{ (new Date(t)).toLocaleString() }}
          </farm-list-item>
        </farm-list>
      </farm-stack>
    `,
  }),
};

export const Base = {
  args: {
    dateLabel: 'Date',
    id: 'date',
    required: true,
    timestamp: 0,
  },
};

export const withTimestamp = {
  args: {
    ...Base.args,
    timestamp: new Date().toISOString(),
  },
};

export const withDateLabel = {
  args: {
    ...Base.args,
    dateLabel: 'Start Date',
  },
};
