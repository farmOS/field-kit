import FarmTiles from '../src/components/FarmTiles.vue';
import FarmPlaceholder from './FarmPlaceholder.vue';

export default {
  title: 'Layout/FarmTiles',
  component: FarmTiles,
  argTypes: {
    space: {
      control: 'select',
      options: ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'none'],
    },
    dividers: {
      control: 'select',
      options: ['regular', 'strong', true, false],
    },
  },
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

export const Default = {};

export const withNoSpace = {
  args: {
    space: 'none',
  },
};

export const withMoreSpace = {
  args: {
    space: 'l',
  },
};

export const withDividers = {
  args: {
    dividers: true,
  },
};

export const withStrongDividers = {
  args: {
    dividers: 'strong',
  },
};
