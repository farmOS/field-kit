import FarmChip from '../components/FarmChip';

export default {
  title: 'Content/FarmChip',
  component: FarmChip,
  argTypes: {
    color: {
      control: {
        type: 'select',
        options: [
          'purple', 'red', 'orange',
          'yellow', 'green', 'blue',
        ],
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['s', 'm', 'l'],
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmChip },
  template: '<farm-chip :color="color" :size="size" :disableClose="disableClose">Tomatoes</farm-chip>',
});

export const Default = Template.bind({});

export const Small = Template.bind({});
Small.args = {
  size: 's',
};

export const Large = Template.bind({});
Large.args = {
  size: 'l',
};

export const Green = Template.bind({});
Green.args = {
  color: 'green',
};

export const Orange = Template.bind({});
Orange.args = {
  color: 'orange',
};

export const DisableClose = Template.bind({});
DisableClose.args = {
  disableClose: true,
};
