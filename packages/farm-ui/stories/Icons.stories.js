import IconsTemplate from './IconsTemplate.vue';

export default {
  title: 'Icons/All',
  component: IconsTemplate,
  argTypes: {
    height: {
      control: {
        type: 'range',
        step: 12,
        min: 12,
        max: 72,
      },
    },
    fill: { control: 'color' },
  },
};

export const Icons = {
  args: {
    height: 60,
    fill: 'black',
  },
};
