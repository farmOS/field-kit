import FarmStack from '../components/FarmStack';
import FarmPlaceholder from './FarmPlaceholder';

export default {
  title: 'Layout/FarmStack',
  component: FarmStack,
  argTypes: {
    space: {
      control: {
        type: 'select',
        options: [
          'xxxs', 'xxs', 'xs', 's',
          'm', 'l', 'xl', 'xxl', 'none',
        ],
      },
    },
    align: {
      control: {
        type: 'select',
        options: [
          'left', 'right', 'center',
        ],
      },
    },
    dividers: {
      control: {
        type: 'select',
        options: [
          'regular', 'strong', true, false,
        ],
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmStack, FarmPlaceholder },
  template: `
    <farm-stack :space="space" :dividers="dividers" :align="align">
      <farm-placeholder/>
      <farm-placeholder height="150px" width="150px"/>
      <farm-placeholder/>
      <farm-placeholder height="150px" width="150px"/>
      <farm-placeholder/>
      <farm-placeholder height="150px" width="150px"/>
    </farm-stack>
  `,
});

export const Default = Template.bind({});

export const withSpace = Template.bind({});
withSpace.args = {
  space: 'm',
};

export const withMoreSpace = Template.bind({});
withMoreSpace.args = {
  space: 'xl',
};

export const AlignCenter = Template.bind({});
AlignCenter.args = {
  align: 'center',
};

export const withDividers = Template.bind({});
withDividers.args = {
  space: 'm',
  dividers: true,
};

export const withStrongDividers = Template.bind({});
withStrongDividers.args = {
  space: 'm',
  dividers: 'strong',
};
