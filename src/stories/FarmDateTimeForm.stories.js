import FarmDateTimeForm from '../components/FarmDateTimeForm';

export default {
  title: 'Content/FarmDateTimeForm',
  component: FarmDateTimeForm,
};

const Template = (args, { argTypes }) => ({
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
          {{ (new Date(t * 1000)).toLocaleString() }}
        </farm-list-item>
      </farm-list>
    </farm-stack>
  `,
});

export const Base = Template.bind({});

export const withTimestamp = Template.bind({});
withTimestamp.args = {
  timestamp: Math.floor(Date.now() / 1000),
};

export const withDateLabel = Template.bind({});
withDateLabel.args = {
  dateLabel: 'Start Date',
};
