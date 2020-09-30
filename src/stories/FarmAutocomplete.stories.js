import FarmAutocomplete from '../components/FarmAutocomplete';

export default {
  title: 'Content/FarmAutocomplete',
  component: FarmAutocomplete,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `
    <farm-stack>
      <farm-autocomplete
        :objects="objects"
        :searchKey="searchKey"
        :searchId="searchId"
        :label="label"
        @results="theResults.push(objects.find(obj => obj[searchId] === $event))"/>
      <farm-inline>
        <farm-chip
          v-for="result in theResults"
          :key="'result-' + result[searchId]">
          {{ result[searchKey] }}
        </farm-chip>
      </farm-inline>
    </farm-stack>
  `,
  data() {
    return {
      theResults: [],
    };
  },
});

export const Basic = Template.bind({});
Basic.args = {
  objects: [
    { id: 1, name: 'Apples' },
    { id: 2, name: 'Artichokes' },
    { id: 3, name: 'Amaranth' },
  ],
  searchKey: 'name',
  searchId: 'id',
  label: 'Select a crop',
};
