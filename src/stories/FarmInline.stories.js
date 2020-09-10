import FarmInline from '../components/FarmInline';
import FarmPlaceholder from './FarmPlaceholder';

export default {
  title: 'Layout/FarmInline',
  component: FarmInline,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmInline, FarmPlaceholder },
  template: `
    <farm-inline :space="space" :justifyContent="justifyContent">
      <farm-placeholder/>
      <farm-placeholder/>
      <farm-placeholder/>
    </farm-inline>
  `,
});

export const Base = Template.bind({});

export const withMoreSpace = Template.bind({});
withMoreSpace.args = {
  space: '3rem',
};

export const justifiedEnd = Template.bind({});
justifiedEnd.args = {
  justifyContent: 'flex-end',
};

export const justifiedSpaceBetween = Template.bind({});
justifiedSpaceBetween.args = {
  justifyContent: 'space-between',
};

export const justifiedSpaceAround = Template.bind({});
justifiedSpaceAround.args = {
  justifyContent: 'space-around',
};
