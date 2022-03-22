import FarmDivider from '../src/components/FarmDivider.vue';

export default {
  title: 'Layout/FarmDivider',
  component: FarmDivider,
  argTypes: {
    weight: {
      control: {
        type: 'select',
        options: [
          'regular', 'strong',
        ],
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmDivider },
  template: `
    <farm-divider :weight="weight"/>
  `,
});

export const Default = Template.bind({});

export const Strong = Template.bind({});
Strong.args = {
  weight: 'strong',
};
