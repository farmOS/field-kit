import FarmInline from '../src/components/FarmInline.vue';
import FarmPlaceholder from './FarmPlaceholder.vue';

export default {
  title: 'Layout/FarmInline',
  component: FarmInline,
  argTypes: {
    alignItems: {
      control: 'select',
      options: ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'],
    },
    justifyContent: {
      control: 'select',
      options: [
        'flex-start',
        'flex-end',
        'center',
        'space-around',
        'space-between',
        'space-evenly',
      ],
    },
    space: {
      control: 'select',
      options: ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'none'],
    },
  },
  render: args => ({
    components: { FarmInline, FarmPlaceholder },
    setup() { return args; },
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

export const Default = {
  args: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    space: 'none',
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

export const justifiedEnd = {
  args: {
    ...Default.args,
    justifyContent: 'flex-end',
  },
};

export const justifiedSpaceBetween = {
  args: {
    ...Default.args,
    justifyContent: 'space-between',
  },
};

export const justifiedSpaceAround = {
  args: {
    ...Default.args,
    justifyContent: 'space-around',
  },
};

export const alignCenter = {
  args: {
    ...Default.args,
    alignItems: 'center',
  },
};
