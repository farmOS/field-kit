// Predicate function for filtering out unwanted whitespace nodes in render
// functions. Native HTML elements should have a `tag` string property, while
// components should have a `type` object containing the component's `name`,
// `props`, etc. There is probably a more elegant solution, but this should work
// for now. I found some relevant comments, for both Vue 2 & Vue 3, here:
// https://stackoverflow.com/q/42950967/1549703
export default function noWhiteSpace(node) {
  return node.tag !== undefined || node.type !== undefined;
}
