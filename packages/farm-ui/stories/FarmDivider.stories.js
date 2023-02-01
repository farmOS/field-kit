import FarmDivider from '../src/components/FarmDivider.vue';

export default {
  title: 'Layout/FarmDivider',
  component: FarmDivider,
  argTypes: {
    weight: {
      control: {
        type: 'select',
        options: ['regular', 'strong'],
      },
    },
  },
};

export const Default = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmDivider },
    template: `
      <farm-divider :weight="weight"/>
    `,
  }),
};

export const Strong = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmDivider },
    template: `
      <farm-divider :weight="weight"/>
    `,
  }),

  args: {
    weight: 'strong',
  },
};
