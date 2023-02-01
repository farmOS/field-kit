import FarmTiles from "../src/components/FarmTiles.vue";
import FarmPlaceholder from "./FarmPlaceholder.vue";

export default {
  title: "Layout/FarmTiles",
  component: FarmTiles,
  argTypes: {
    space: {
      control: {
        type: "select",
        options: ["xxxs", "xxs", "xs", "s", "m", "l", "xl", "xxl", "none"],
      },
    },
    dividers: {
      control: {
        type: "select",
        options: ["regular", "strong", true, false],
      },
    },
  },
};

export const Default = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTiles, FarmPlaceholder },
    template: `
      <farm-tiles :space="space" :columns="[1, 2, 3]" :dividers="dividers">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-tiles>
    `,
  }),
};

export const withNoSpace = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTiles, FarmPlaceholder },
    template: `
      <farm-tiles :space="space" :columns="[1, 2, 3]" :dividers="dividers">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-tiles>
    `,
  }),

  args: {
    space: "none",
  },
};

export const withMoreSpace = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTiles, FarmPlaceholder },
    template: `
      <farm-tiles :space="space" :columns="[1, 2, 3]" :dividers="dividers">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-tiles>
    `,
  }),

  args: {
    space: "l",
  },
};

export const withDividers = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTiles, FarmPlaceholder },
    template: `
      <farm-tiles :space="space" :columns="[1, 2, 3]" :dividers="dividers">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-tiles>
    `,
  }),

  args: {
    dividers: true,
  },
};

export const withStrongDividers = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTiles, FarmPlaceholder },
    template: `
      <farm-tiles :space="space" :columns="[1, 2, 3]" :dividers="dividers">
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
        <farm-placeholder/>
        <farm-placeholder height="150px" width="150px"/>
      </farm-tiles>
    `,
  }),

  args: {
    dividers: "strong",
  },
};
