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
    setup() { return args; },
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

export const Default = {
  args: {
    space: 'none',
    align: 'left',
    dividers: false,
  },
};

export const withSpace = {
  args: {
    ...Default.args,
    space: 'm',
  },
};

export const withMoreSpace = {
  args: {
    ...Default.args,
    space: 'xl',
  },
};

export const AlignCenter = {
  args: {
    ...Default.args,
    align: 'center',
  },
};

export const withDividers = {
  args: {
    ...Default.args,
    space: 'm',
    dividers: true,
  },
};

export const withStrongDividers = {
  args: {
    ...Default.args,
    space: 'm',
    dividers: 'strong',
  },
};
