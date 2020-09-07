import FarmChip from '../components/FarmChip';

export default {
  title: 'Content/FarmChip',
  component: FarmChip,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmChip },
  template: '<farm-inline><farm-chip :color="color">Tomatoes</farm-chip></farm-inline>',
});

export const Primary = Template.bind({});
Primary.args = {
  color: 'cyan',
};

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'green',
};
