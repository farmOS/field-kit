<template>
  <farm-stack>
    <farm-autocomplete
      :objects="objects"
      :searchKey="searchKey"
      :searchId="searchId"
      :label="label"
      @results="results.push(objects.find(obj => obj[searchId] === $event))"/>
    <farm-inline>
      <farm-chip
        v-for="result in results"
        :key="`result-${result[searchId]}`">
        {{ result[searchKey] }}
      </farm-chip>
    </farm-inline>
  </farm-stack>
</template>

<script>
export default {
  name: 'FarmAutocompleteTemplate.vue',
  props: [
    'objects',
    'searchKey',
    'searchId',
    'label',
  ],
  data() {
    return {
      results: [],
    };
  },
};
</script>

<style scoped>

</style>
