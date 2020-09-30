import FarmTiles from '../components/FarmTiles';
import FarmPlaceholder from './FarmPlaceholder';

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
    <farm-tiles :space="space" :columns="columns" :dividers="dividers">
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

export const withSpace = Template.bind({});
withSpace.args = {
  space: 'm',
};

export const withMoreSpace = Template.bind({});
withMoreSpace.args = {
  space: 'xl',
};

export const withDividers = Template.bind({});
withDividers.args = {
  space: 'm',
  dividers: true,
};

export const withStrongDividers = Template.bind({});
withStrongDividers.args = {
  space: 'm',
  dividers: 'strong',
};
