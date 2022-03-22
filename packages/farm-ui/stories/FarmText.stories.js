import FarmText from '../src/components/FarmText.vue';

export default {
  title: 'Content/FarmText',
  component: FarmText,
  argTypes: {
    as: {
      control: {
        type: 'select',
        options: [
          'p', 'div', 'span', 'li', 'pre', 'label', 'input',
        ],
      },
    },
    color: {
      control: {
        type: 'select',
        options: [
          'text', 'dark', 'subtle', 'white',
          'primary', 'secondary', 'tertiary',
        ],
      },
    },
    size: {
      control: {
        type: 'select',
        options: [
          's', 'm', 'l', 'xl',
        ],
      },
    },
    weight: {
      control: {
        type: 'select',
        options: [
          'regular', 'strong',
        ],
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmText },
  template: `
    <farm-text :as="as" :color="color" :size="size" :weight="weight">
      Hello, World!
    </farm-text>
  `,
});

export const Default = Template.bind({});

export const asSpanTag = Template.bind({});
asSpanTag.args = {
  as: 'span',
};

export const Small = Template.bind({});
Small.args = {
  size: 's',
};

export const Large = Template.bind({});
Large.args = {
  size: 'l',
};

export const Strong = Template.bind({});
Strong.args = {
  weight: 'strong',
};
