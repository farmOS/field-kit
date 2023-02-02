import FarmCard from '../src/components/FarmCard.vue';
import FarmStack from '../src/components/FarmStack.vue';
import FarmInline from '../src/components/FarmInline.vue';

export default {
  title: 'Layout/FarmCard',
  component: FarmCard,
  subcomponents: { FarmStack, FarmInline },
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
  render: (args) => ({
    template: `
      <farm-card :space="space" :width="width" :boxShadow="boxShadow" :backgroundColor="backgroundColor">
        <farm-stack>
          <farm-inline><h3>Title</h3></farm-inline>
          <farm-inline><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></farm-inline>
        </farm-stack>
      </farm-card>
    `,
  }),
};

export const Default = {};

export const MoreSpace = {
  args: {
    space: 'l',
  },
};

export const Small = {
  args: {
    width: 's',
  },
};

export const Medium = {
  args: {
    width: 'm',
  },
};

export const FitContent = {
  args: {
    width: 'content',
  },
};

export const ResponsiveWidth = {
  args: {
    width: ['s', 'm', 'l'],
  },
};

export const StrongShadow = {
  args: {
    boxShadow: 'strong',
  },
};

export const BlueBackground = {
  args: {
    backgroundColor: 'blue',
  },
};
