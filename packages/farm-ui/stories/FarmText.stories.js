import FarmText from "../src/components/FarmText.vue";

export default {
  title: "Content/FarmText",
  component: FarmText,
  argTypes: {
    as: {
      control: {
        type: "select",
        options: ["p", "div", "span", "li", "pre", "label", "input"],
      },
    },
    color: {
      control: {
        type: "select",
        options: [
          "text",
          "dark",
          "subtle",
          "white",
          "primary",
          "secondary",
          "tertiary",
        ],
      },
    },
    size: {
      control: {
        type: "select",
        options: ["s", "m", "l", "xl"],
      },
    },
    weight: {
      control: {
        type: "select",
        options: ["regular", "strong"],
      },
    },
  },
};

export const Default = {
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

export const asSpanTag = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmText },
    template: `
      <farm-text :as="as" :color="color" :size="size" :weight="weight">
        Hello, World!
      </farm-text>
    `,
  }),

  args: {
    as: "span",
  },
};

export const Small = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmText },
    template: `
      <farm-text :as="as" :color="color" :size="size" :weight="weight">
        Hello, World!
      </farm-text>
    `,
  }),

  args: {
    size: "s",
  },
};

export const Large = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmText },
    template: `
      <farm-text :as="as" :color="color" :size="size" :weight="weight">
        Hello, World!
      </farm-text>
    `,
  }),

  args: {
    size: "l",
  },
};

export const Strong = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmText },
    template: `
      <farm-text :as="as" :color="color" :size="size" :weight="weight">
        Hello, World!
      </farm-text>
    `,
  }),

  args: {
    weight: "strong",
  },
};
