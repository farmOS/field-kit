import FarmCard from '../src/components/FarmCard.vue';
import FarmStack from '../src/components/FarmStack.vue';
import FarmInline from '../src/components/FarmInline.vue';

export default {
  title: 'Layout/FarmCard',
  component: FarmCard,
  subcomponents: { FarmStack, FarmInline },
  argTypes: {
    backgroundColor: {
      control: {
        type: 'select',
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
    },
    boxShadow: {
      control: {
        type: 'select',
        options: ['normal', 'strong', 'inverse', 'none'],
      },
    },
    space: {
      control: {
        type: 'select',
        options: ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'none'],
      },
    },
    width: {
      control: {
        type: 'select',
        options: ['s', 'm', 'l', 'xl', 'full', 'content'],
      },
    },
  },
};

export const Default = {
  render: (args, { argTypes }) => ({
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
  }),
};

export const MoreSpace = {
  render: (args, { argTypes }) => ({
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
  }),

  args: {
    space: 'l',
  },
};

export const Small = {
  render: (args, { argTypes }) => ({
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
  }),

  args: {
    width: 's',
  },
};

export const Medium = {
  render: (args, { argTypes }) => ({
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
  }),

  args: {
    width: 'm',
  },
};

export const FitContent = {
  render: (args, { argTypes }) => ({
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
  }),

  args: {
    width: 'content',
  },
};

export const ResponsiveWidth = {
  render: (args, { argTypes }) => ({
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
  }),

  args: {
    width: ['s', 'm', 'l'],
  },
};

export const StrongShadow = {
  render: (args, { argTypes }) => ({
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
  }),

  args: {
    boxShadow: 'strong',
  },
};

export const BlueBackground = {
  render: (args, { argTypes }) => ({
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
  }),

  args: {
    backgroundColor: 'blue',
  },
};
