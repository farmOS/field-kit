import FarmTextLabel from '../src/components/FarmTextLabel.vue';

export default {
  title: 'Content/FarmTextLabel',
  component: FarmTextLabel,
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
  },
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTextLabel },
    setup() { return args; },
    template: `
      <farm-text-label :as="as" :color="color" :size="size">
        Label
      </farm-text-label>
    `,
  }),
};

export const Default = {
  args: {
    as: 'label',
    size: 'm',
    color: 'text',
  },
};

export const asPTag = {
  args: {
    ...Default.args,
    as: 'p',
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
