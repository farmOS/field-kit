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
    disableClose: {
      control: 'boolean',
    },
  },
  render: args => ({
    setup() { return args; },
    template:
      '<farm-chip :color="color" :size="size" :disableClose="disableClose">Tomatoes</farm-chip>',
  }),
};

export const Default = {
  args: {
    color: 'blue',
    size: 'm',
    disableClose: false,
  },
};

export const Small = {
  args: {
    ...Default.args,
    size: 's',
  },
};

export const Large = {
  args: {
    ...Default.args,
    size: 'l',
  },
};

export const Green = {
  args: {
    ...Default.args,
    color: 'green',
  },
};

export const Orange = {
  args: {
    ...Default.args,
    color: 'orange',
  },
};

export const DisableClose = {
  args: {
    ...Default.args,
    disableClose: true,
  },
};
