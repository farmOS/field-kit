import FarmStack from '../src/components/FarmStack.vue';
import FarmPlaceholder from './FarmPlaceholder.vue';

export default {
  title: 'Layout/FarmStack',
  component: FarmStack,
  argTypes: {
    space: {
      control: 'select',
      options: ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'none'],
    },
    align: {
      control: 'select',
      options: ['left', 'right', 'center'],
    },
    dividers: {
      control: 'select',
      options: ['regular', 'strong', true, false],
    },
  },
  render: (args, { argTypes }) => ({
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
  }),
};

export const Default = {};

export const withSpace = {
  args: {
    space: 'm',
  },
};

export const withMoreSpace = {
  args: {
    space: 'xl',
  },
};

export const AlignCenter = {
  args: {
    align: 'center',
  },
};

export const withDividers = {
  args: {
    space: 'm',
    dividers: true,
  },
};

export const withStrongDividers = {
  args: {
    space: 'm',
    dividers: 'strong',
  },
};
