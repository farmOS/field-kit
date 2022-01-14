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

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { IconsTemplate },
  template: '<icons-template :height="height" :fill="fill"/>',
});

export const Icons = Template.bind({});
Icons.args = {
  height: 60,
  fill: 'black',
};
