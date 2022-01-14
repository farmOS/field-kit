import FarmMenuBar from '../components/FarmMenuBar.vue';

export default {
  title: 'Layout/FarmMenuBar',
  component: FarmMenuBar,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmMenuBar },
  template: `
    <div style="position: relative; transform: scale(1)">
      <farm-menu-bar>
        <template #left-menu><h3>Menu Bar</h3></template>
        <template #right-menu><icon-delete/></template>
        <template #right-menu><icon-delete/></template>
        <template #more-menu>
          <li>Delete</li>
          <li>Settings</li>
        </template>
      </farm-menu-bar>
    </div>
  `,
});

export const Default = Template.bind({});
