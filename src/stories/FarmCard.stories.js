import FarmCard from '../components/FarmCard';

export default {
  title: 'Content/FarmCard',
  component: FarmCard,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmCard },
  template: args.template || '<farm-card><p>Body text</p></farm-card>',
});

export const Basic = Template.bind({});

export const WithTitle = Template.bind({});
WithTitle.args = {
  template: '<farm-card><farm-inline><h4>Title</h4></farm-inline></farm-card>',
};

export const WithChips = Template.bind({});
WithChips.args = {
  template: '<farm-card><farm-stack><farm-inline><h4>Title</h4></farm-inline><farm-inline><farm-chip>Tomatoes</farm-chip><farm-chip color="green">Broccoli</farm-chip></farm-inline></farm-stack></farm-card>',
};
