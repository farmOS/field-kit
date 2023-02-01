import FarmInline from '../src/components/FarmInline.vue';
import FarmPlaceholder from './FarmPlaceholder.vue';

export default {
  title: 'Layout/FarmInline',
  component: FarmInline,
  argTypes: {
    alignItems: {
      control: {
        type: 'select',
        options: ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'],
      },
    },
    justifyContent: {
      control: {
        type: 'select',
        options: [
          'flex-start',
          'flex-end',
          'center',
          'space-around',
          'space-between',
          'space-evenly',
        ],
      },
    },
    space: {
      control: {
        type: 'select',
        options: ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'none'],
      },
    },
  },
};

export const Default = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmInline, FarmPlaceholder },
    template: `
      <farm-inline :space="space" :justifyContent="justifyContent" :alignItems="alignItems">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-inline>
    `,
  }),
};

export const withSpace = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmInline, FarmPlaceholder },
    template: `
      <farm-inline :space="space" :justifyContent="justifyContent" :alignItems="alignItems">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-inline>
    `,
  }),

  args: {
    space: 'm',
  },
};

export const withMoreSpace = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmInline, FarmPlaceholder },
    template: `
      <farm-inline :space="space" :justifyContent="justifyContent" :alignItems="alignItems">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-inline>
    `,
  }),

  args: {
    space: 'xl',
  },
};

export const justifiedEnd = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmInline, FarmPlaceholder },
    template: `
      <farm-inline :space="space" :justifyContent="justifyContent" :alignItems="alignItems">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-inline>
    `,
  }),

  args: {
    justifyContent: 'flex-end',
  },
};

export const justifiedSpaceBetween = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmInline, FarmPlaceholder },
    template: `
      <farm-inline :space="space" :justifyContent="justifyContent" :alignItems="alignItems">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-inline>
    `,
  }),

  args: {
    justifyContent: 'space-between',
  },
};

export const justifiedSpaceAround = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmInline, FarmPlaceholder },
    template: `
      <farm-inline :space="space" :justifyContent="justifyContent" :alignItems="alignItems">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-inline>
    `,
  }),

  args: {
    justifyContent: 'space-around',
  },
};

export const alignCenter = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmInline, FarmPlaceholder },
    template: `
      <farm-inline :space="space" :justifyContent="justifyContent" :alignItems="alignItems">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-inline>
    `,
  }),

  args: {
    alignItems: 'center',
  },
};
