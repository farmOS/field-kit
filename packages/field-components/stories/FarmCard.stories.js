import FarmCard from '../src/components/FarmCard.vue';
import FarmStack from '../src/components/FarmStack.vue';
import FarmInline from '../src/components/FarmInline.vue';

const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do '
  + 'eiusmod tempor incididunt ut labore et dolore magna aliqua.';

export default {
  title: 'Layout/FarmCard',
  component: FarmCard,
  argTypes: {
    backgroundColor: {
      control: 'select',
      options: [
        'white',
        'dark',
        'primary',
        'secondary',
        'tertiary',
        'purple',
        'red',
        'orange',
        'yellow',
        'green',
        'blue',
      ],
    },
    boxShadow: {
      control: 'select',
      options: ['normal', 'strong', 'inverse', 'none'],
    },
    space: {
      control: 'select',
      options: ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'none'],
    },
    width: {
      control: 'select',
      options: ['s', 'm', 'l', 'xl', 'full', 'content'],
    },
  },
  render: args => ({
    components: { FarmCard, FarmInline, FarmStack },
    setup() { return args; },
    template: `
      <farm-card
        :space="space"
        :width="width"
        :boxShadow="boxShadow"
        :backgroundColor="backgroundColor">
        <farm-stack>
          <farm-inline><h3>Title</h3></farm-inline>
          <farm-inline><p>${lorem}</p></farm-inline>
        </farm-stack>
      </farm-card>
    `,
  }),
};

export const Default = {
  args: {
    backgroundColor: 'white',
    boxShadow: 'normal',
    space: 's',
    width: 'full',
  },
};

export const MoreSpace = {
  args: {
    ...Default.args,
    space: 'l',
  },
};

export const Small = {
  args: {
    ...Default.args,
    width: 's',
  },
};

export const Medium = {
  args: {
    ...Default.args,
    width: 'm',
  },
};

export const FitContent = {
  args: {
    ...Default.args,
    width: 'content',
  },
};

export const ResponsiveWidth = {
  args: {
    ...Default.args,
    width: ['s', 'm', 'l'],
  },
};

export const StrongShadow = {
  args: {
    ...Default.args,
    boxShadow: 'strong',
  },
};

export const BlueBackground = {
  args: {
    ...Default.args,
    backgroundColor: 'blue',
  },
};
