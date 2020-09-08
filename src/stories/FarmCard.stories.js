import FarmCard from '../components/FarmCard';
import FarmStack from '../components/FarmStack';
import FarmInline from '../components/FarmInline';

export default {
  title: 'Content/FarmCard',
  component: FarmCard,
  subcomponents: { FarmStack, FarmInline },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmCard },
  template: `
    <farm-card :space="space" :width="width" :height="height" :breakpoints="breakpoints" :boxShadow="boxShadow" :backgroundColor="backgroundColor">
      <farm-stack>
        <farm-inline><h4>Title</h4></farm-inline>
        <farm-inline><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p></farm-inline>
        <farm-inline>
          <farm-chip>Tomatoes</farm-chip>
          <farm-chip color="green">Broccoli</farm-chip>
        </farm-inline>
      </farm-stack>
    </farm-card>
  `,
});

export const Basic = Template.bind({});

export const withMoreSpace = Template.bind({});
withMoreSpace.args = {
  space: '3rem',
};

export const withWidth = Template.bind({});
withWidth.args = {
  width: '400px',
};

export const withResponsiveWidth = Template.bind({});
withResponsiveWidth.args = {
  width: ['200px', '400px', '600px'],
};
