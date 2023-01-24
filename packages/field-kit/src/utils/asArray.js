// Wrap a value in an array, unless it's nullish, then return an empty array.
const asArray = value => (value ? [value] : []);

// Like above, but checks if the value is already an array and if so returns it as is.
export const asFlatArray = value => (Array.isArray(value) ? value : asArray(value));

// Like asFlatArray() or Array.from(), but with a few more differences: unlike
// asFlatArray(), it will always return a shallow copy and will handle iterable
// objects as well; and unlike Array.from(), it will return the empty array for
// nullish values instead of throwing an exception, while all other non-nullish,
// non-iterable values will be returned wrapped in a new array.
export const fromFlatArray = value => (
  typeof value[Symbol.iterator] === 'function'
    ? Array.from(value)
    : (value ? [value] : [])
).flat(Infinity);

export default asArray;
