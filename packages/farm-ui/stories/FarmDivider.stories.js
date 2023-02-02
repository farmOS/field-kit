import FarmDivider from '../src/components/FarmDivider.vue';

export default {
  title: 'Layout/FarmDivider',
  component: FarmDivider,
  argTypes: {
    weight: {
      control: 'select',
      options: ['regular', 'strong'],
    },
  },
};

export const Default = {};

export const Strong = {
  args: {
    weight: 'strong',
  },
};
