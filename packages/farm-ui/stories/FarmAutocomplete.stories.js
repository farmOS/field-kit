import FarmAutocomplete from '../src/components/FarmAutocomplete.vue';

export default {
  title: 'Content/FarmAutocomplete',
  component: FarmAutocomplete,
};

export const Basic = {
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    template: `
      <farm-stack>
        <farm-autocomplete
          :list="list"
          :keys="keys"
          :label="label"
          @select="theResults.push(list[$event])"/>
        <farm-inline>
          <farm-chip
            v-for="(result, i) in theResults"
            :key="'result-' + i">
            {{ result.name }}
          </farm-chip>
        </farm-inline>
      </farm-stack>
    `,
    data() {
      return {
        theResults: [],
      };
    },
  }),

  args: {
    list: [
      { id: 1, name: 'Apples' },
      { id: 2, name: 'Artichokes' },
      { id: 3, name: 'Amaranth' },
    ],
    keys: ['name'],
    label: 'Select a crop',
  },
};
