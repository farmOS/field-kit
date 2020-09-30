import FarmCard from '../components/FarmCard';
import FarmStack from '../components/FarmStack';
import FarmInline from '../components/FarmInline';

export default {
  title: 'Content/FarmCard',
  component: FarmCard,
  subcomponents: { FarmStack, FarmInline },
  argTypes: {
    backgroundColor: {
      control: {
        type: 'select',
        options: [
          'white', 'dark', 'primary', 'secondary', 'tertiary',
          'purple', 'red', 'orange', 'yellow', 'green', 'blue',
        ],
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmCard },
  template: `
    <farm-card :space="space" :width="width" :boxShadow="boxShadow" :backgroundColor="backgroundColor">
      <farm-stack>
        <farm-inline><h3>Title</h3></farm-inline>
        <farm-inline><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></farm-inline>
      </farm-stack>
    </farm-card>
  `,
});

export const Default = Template.bind({});

export const MoreSpace = Template.bind({});
MoreSpace.args = {
  space: 'l',
};

export const Small = Template.bind({});
Small.args = {
  width: 's',
};

export const Medium = Template.bind({});
Medium.args = {
  width: 'm',
};

export const ResponsiveWidth = Template.bind({});
ResponsiveWidth.args = {
  width: ['s', 'm', 'l'],
};

export const BlueBackground = Template.bind({});
BlueBackground.args = {
  backgroundColor: 'blue',
};
