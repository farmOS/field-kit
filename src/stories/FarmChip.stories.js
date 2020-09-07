import FarmChip from '../components/FarmChip';

export default {
  title: 'Content/FarmChip',
  component: FarmChip,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmChip },
  template: '<farm-chip :color="color" :disableClose="disableClose">Tomatoes</farm-chip>',
});

export const Primary = Template.bind({});
Primary.args = {
  color: 'cyan',
};

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'green',
};

export const DisableClose = Template.bind({});
DisableClose.args = {
  disableClose: true,
};
