import FarmStack from '../src/components/FarmStack.vue';
import FarmPlaceholder from './FarmPlaceholder.vue';

export default {
  title: 'Layout/FarmStack',
  component: FarmStack,
  argTypes: {
    space: {
      control: {
        type: 'select',
        options: ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'none'],
      },
    },
    align: {
      control: {
        type: 'select',
        options: ['left', 'right', 'center'],
      },
    },
    dividers: {
      control: {
        type: 'select',
        options: ['regular', 'strong', true, false],
      },
    },
  },
};

export const Default = {
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

export const withSpace = {
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

  args: {
    space: 'm',
  },
};

export const withMoreSpace = {
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

  args: {
    space: 'xl',
  },
};

export const AlignCenter = {
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

  args: {
    align: 'center',
  },
};

export const withDividers = {
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

  args: {
    space: 'm',
    dividers: true,
  },
};

export const withStrongDividers = {
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

  args: {
    space: 'm',
    dividers: 'strong',
  },
};
