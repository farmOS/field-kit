import FarmTiles from '../components/FarmTiles.vue';
import FarmPlaceholder from './FarmPlaceholder.vue';

export default {
  title: 'Layout/FarmTiles',
  component: FarmTiles,
  argTypes: {
    space: {
      control: {
        type: 'select',
        options: [
          'xxxs', 'xxs', 'xs', 's',
          'm', 'l', 'xl', 'xxl', 'none',
        ],
      },
    },
    dividers: {
      control: {
        type: 'select',
        options: [
          'regular', 'strong', true, false,
        ],
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
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
});

export const Default = Template.bind({});

export const withNoSpace = Template.bind({});
withNoSpace.args = {
  space: 'none',
};

export const withMoreSpace = Template.bind({});
withMoreSpace.args = {
  space: 'l',
};

export const withDividers = Template.bind({});
withDividers.args = {
  dividers: true,
};

export const withStrongDividers = Template.bind({});
withStrongDividers.args = {
  dividers: 'strong',
};
