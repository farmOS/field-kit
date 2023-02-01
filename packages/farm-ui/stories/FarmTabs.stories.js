import FarmTabs from '../src/components/FarmTabs.vue';
import FarmPlaceholder from './FarmPlaceholder.vue';

const control = {
  control: {
    type: 'select',
    options: ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'none'],
  },
};

export default {
  title: 'Layout/FarmTabs',
  component: FarmTabs,
  argTypes: {
    space: control,
  },
};

export const Default = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTabs, FarmPlaceholder },
    template: `
      <div style="position: relative; transform: scale(1)">
        <farm-menu-bar :more="false">
          <template #left-menu><h3>Menu Bar</h3></template>
        </farm-menu-bar>
        <farm-tabs
          :tabs="['One', 'Two']"
          :space="['none', 'none', 'm']">
          <template #one>
            <farm-tiles>
              <farm-placeholder height="100%" width="100%"/>
              <farm-placeholder height="100%" width="100%"/>
              <farm-placeholder height="100%" width="100%"/>
              <farm-placeholder height="100%" width="100%"/>
              <farm-placeholder height="100%" width="100%"/>
              <farm-placeholder height="100%" width="100%"/>
            </farm-tiles>
          </template>
          <template #two>
            <farm-tiles>
              <farm-placeholder height="100%" width="100%"/>
              <farm-placeholder height="100%" width="100%"/>
              <farm-placeholder height="100%" width="100%"/>
              <farm-placeholder height="100%" width="100%"/>
              <farm-placeholder height="100%" width="100%"/>
              <farm-placeholder height="100%" width="100%"/>
            </farm-tiles>
          </template>
        </farm-tabs>
      </div>
    `,
  }),
};
