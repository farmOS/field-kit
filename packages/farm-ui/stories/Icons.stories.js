import IconsTemplate from "./IconsTemplate.vue";

export default {
  title: "Icons/All",
  component: IconsTemplate,
  argTypes: {
    height: {
      control: {
        type: "range",
        step: 12,
        min: 12,
        max: 72,
      },
    },
    fill: { control: "color" },
  },
};

export const Icons = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { IconsTemplate },
    template: '<icons-template :height="height" :fill="fill"/>',
  }),

  args: {
    height: 60,
    fill: "black",
  },
};
