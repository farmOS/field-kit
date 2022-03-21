import FarmInline from '../components/FarmInline.vue';
import FarmPlaceholder from './FarmPlaceholder.vue';

export default {
  title: 'Layout/FarmInline',
  component: FarmInline,
  argTypes: {
    alignItems: {
      control: {
        type: 'select',
        options: [
          'stretch', 'flex-start', 'flex-end',
          'center', 'baseline',
        ],
      },
    },
    justifyContent: {
      control: {
        type: 'select',
        options: [
          'flex-start', 'flex-end', 'center',
          'space-around', 'space-between', 'space-evenly',
        ],
      },
    },
    space: {
      control: {
        type: 'select',
        options: [
          'xxxs', 'xxs', 'xs', 's',
          'm', 'l', 'xl', 'xxl', 'none',
        ],
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmInline, FarmPlaceholder },
  template: `
    <farm-inline :space="space" :justifyContent="justifyContent" :alignItems="alignItems">
      <farm-placeholder/>
      <farm-placeholder height="150px" width="150px"/>
      <farm-placeholder/>
      <farm-placeholder height="150px" width="150px"/>
      <farm-placeholder/>
      <farm-placeholder height="150px" width="150px"/>
    </farm-inline>
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

export const alignCenter = Template.bind({});
alignCenter.args = {
  alignItems: 'center',
};
