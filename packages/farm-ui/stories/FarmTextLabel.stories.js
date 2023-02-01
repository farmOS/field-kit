import FarmTextLabel from '../src/components/FarmTextLabel.vue';

export default {
  title: 'Content/FarmTextLabel',
  component: FarmTextLabel,
  argTypes: {
    as: {
      control: {
        type: 'select',
        options: ['p', 'div', 'span', 'li', 'pre', 'label', 'input'],
      },
    },
    color: {
      control: {
        type: 'select',
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
    },
    size: {
      control: {
        type: 'select',
        options: ['s', 'm', 'l', 'xl'],
      },
    },
  },
};

export const Default = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTextLabel },
    template: `
      <farm-text-label :as="as" :color="color" :size="size">
        Label
      </farm-text-label>
    `,
  }),
};

export const asPTag = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTextLabel },
    template: `
      <farm-text-label :as="as" :color="color" :size="size">
        Label
      </farm-text-label>
    `,
  }),

  args: {
    as: 'p',
  },
};

export const Small = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTextLabel },
    template: `
      <farm-text-label :as="as" :color="color" :size="size">
        Label
      </farm-text-label>
    `,
  }),

  args: {
    size: 's',
  },
};

export const Large = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTextLabel },
    template: `
      <farm-text-label :as="as" :color="color" :size="size">
        Label
      </farm-text-label>
    `,
  }),

  args: {
    size: 'l',
  },
};
