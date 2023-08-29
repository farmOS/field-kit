import FarmTabs from '../src/components/FarmTabs.vue';
import FarmPlaceholder from './FarmPlaceholder.vue';

export default {
  title: 'Layout/FarmTabs',
  component: FarmTabs,
  argTypes: {
    space: {
      type: 'select',
      options: ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'none'],
    },
  },
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { FarmTabs, FarmPlaceholder },
    setup() { return args; },
    template: `
      <div style="position: relative; transform: scale(1)">
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

export const Default = {
  args: {
    tabs: ['One', 'Two'],
    space: ['none', 'none', 'm'],
  },
};
