import FarmAutocomplete from '../components/FarmAutocomplete';
import FarmAutocompleteTemplate from './FarmAutocompleteTemplate';

export default {
  title: 'Content/FarmAutocomplete',
  component: FarmAutocomplete,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FarmAutocompleteTemplate },
  template: '<farm-autocomplete-template :objects="objects" :searchKey="searchKey" :searchId="searchId" :label="label"/>',
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
