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
    template: `
      <farm-text :as="as" :color="color" :size="size" :weight="weight">
        Hello, World!
      </farm-text>
    `,
  }),
};

export const Default = {};

export const asSpanTag = {
  args: {
    as: 'span',
  },
};

export const Small = {
  args: {
    size: 's',
  },
};

export const Large = {
  args: {
    size: 'l',
  },
};

export const Strong = {
  args: {
    weight: 'strong',
  },
};
