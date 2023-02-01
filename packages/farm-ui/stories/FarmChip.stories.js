import FarmChip from "../src/components/FarmChip.vue";

export default {
  title: "Content/FarmChip",
  component: FarmChip,
  argTypes: {
    color: {
      control: {
        type: "select",
        options: ["purple", "red", "orange", "yellow", "green", "blue"],
      },
    },
    size: {
      control: {
        type: "select",
        options: ["s", "m", "l"],
      },
    },
  },
};

export const Default = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmChip },
    template:
      '<farm-chip :color="color" :size="size" :disableClose="disableClose">Tomatoes</farm-chip>',
  }),
};

export const Small = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmChip },
    template:
      '<farm-chip :color="color" :size="size" :disableClose="disableClose">Tomatoes</farm-chip>',
  }),

  args: {
    size: "s",
  },
};

export const Large = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmChip },
    template:
      '<farm-chip :color="color" :size="size" :disableClose="disableClose">Tomatoes</farm-chip>',
  }),

  args: {
    size: "l",
  },
};

export const Green = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmChip },
    template:
      '<farm-chip :color="color" :size="size" :disableClose="disableClose">Tomatoes</farm-chip>',
  }),

  args: {
    color: "green",
  },
};

export const Orange = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmChip },
    template:
      '<farm-chip :color="color" :size="size" :disableClose="disableClose">Tomatoes</farm-chip>',
  }),

  args: {
    color: "orange",
  },
};

export const DisableClose = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmChip },
    template:
      '<farm-chip :color="color" :size="size" :disableClose="disableClose">Tomatoes</farm-chip>',
  }),

  args: {
    disableClose: true,
  },
};
