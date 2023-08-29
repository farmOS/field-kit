import FarmText from '../src/components/FarmText.vue';

export default {
  title: 'Content/FarmText',
  component: FarmText,
  argTypes: {
    as: {
      control: 'select',
      options: ['p', 'div', 'span', 'li', 'pre', 'label', 'input'],
    },
    color: {
      control: 'select',
      options: [
        'text',
        'dark',
        'subtle',
        'white',
        'primary',
        'secondary',
        'tertiary',
      ],
    },
    size: {
      control: 'select',
      options: ['s', 'm', 'l', 'xl'],
    },
    weight: {
      control: 'select',
      options: ['regular', 'strong'],
    },
  },
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmText },
    setup() { return args; },
    template: `
      <farm-text :as="as" :color="color" :size="size" :weight="weight">
        Hello, World!
      </farm-text>
    `,
  }),
};

export const Default = {
  args: {
    as: 'p',
    size: 'm',
    color: 'text',
    weight: 'regular',
  },
};

export const asSpanTag = {
  args: {
    ...Default.args,
    as: 'span',
  },
};

export const Small = {
  args: {
    ...Default.args,
    size: 's',
  },
};

export const Large = {
  args: {
    ...Default.args,
    size: 'l',
  },
};

export const Strong = {
  args: {
    ...Default.args,
    weight: 'strong',
  },
};
