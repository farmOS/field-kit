import FarmChip from '../src/components/FarmChip.vue';

export default {
  title: 'Content/FarmChip',
  component: FarmChip,
  argTypes: {
    color: {
      control: 'select',
      options: ['purple', 'red', 'orange', 'yellow', 'green', 'blue'],
    },
    size: {
      control: 'select',
      options: ['s', 'm', 'l'],
    },
  },
  render: (args) => ({
    template:
      '<farm-chip :color="color" :size="size" :disableClose="disableClose">Tomatoes</farm-chip>',
  }),
};

export const Default = {};

export const Small = {
  args: {
    size: 's',
  },
};

export const Large = {
  args: {
    size: 'l',
  },
};

export const Green = {
  args: {
    color: 'green',
  },
};

export const Orange = {
  args: {
    color: 'orange',
  },
};

export const DisableClose = {
  args: {
    disableClose: true,
  },
};
