// Wrap a value in an array, unless it's nullish, then return an empty array.
const asArray = value => (value ? [value] : []);

export default asArray;
