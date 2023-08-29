import FarmMain from '../src/components/FarmMain.vue';
import FarmPlaceholder from './FarmPlaceholder.vue';

const control = {
  control: 'select',
  options: ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'none'],
};

export default {
  title: 'Layout/FarmMain',
  component: FarmMain,
  argTypes: {
    space: control,
    paddingX: control,
    paddingY: control,
    paddingTop: control,
    paddingRight: control,
    paddingBottom: control,
    paddingLeft: control,
  },
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmMain, FarmPlaceholder },
    setup() { return args; },
    template: `
      <div style="position: relative; transform: scale(1)">
        <farm-menu-bar :more="false">
          <template #left-menu><h3>Menu Bar</h3></template>
        </farm-menu-bar>
        <farm-main
          :space="space"
          :paddingX="paddingX"
          :paddingY="paddingY"
          :paddingTop="paddingTop"
          :paddingRight="paddingRight"
          :paddingBottom="paddingBottom"
          :paddingLeft="paddingLeft">
          <farm-tiles>
            <farm-placeholder height="100%" width="100%"/>
            <farm-placeholder height="100%" width="100%"/>
            <farm-placeholder height="100%" width="100%"/>
            <farm-placeholder height="100%" width="100%"/>
            <farm-placeholder height="100%" width="100%"/>
            <farm-placeholder height="100%" width="100%"/>
          </farm-tiles>
        </farm-main>
      </div>
    `,
  }),
};

export const Default = {
  args: {
    space: 's',
    paddingX: 's',
    paddingY: 's',
    paddingTop: 's',
    paddingRight: 's',
    paddingBottom: 's',
    paddingLeft: 's',
  },
};
