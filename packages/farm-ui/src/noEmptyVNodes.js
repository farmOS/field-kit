import { Comment, Fragment } from 'vue'

// Predicate function for filtering out unwanted whitespace, comments and empty
// fragments from VNodes in render functions. In the future it might be good to
// accept a second object parameter, with options like `keepEmptyStrings` and
// `keepEmptyFragment`, but this suffices for now. Vue exports a few other
// Symbols for identifying VNode types, which can be found here:
// https://github.com/vuejs/core/blob/c35ec47d73212b1b1fb1abca9004f992c45aa942/packages/runtime-core/src/vnode.ts#L47-L55
export default function noEmptyNodes(node) {
  const isHtmlTag = node.tag !== undefined;
  const isFragment = node.type === Fragment;
  const isComment = node.type === Comment;
  const isComponent = node.type && typeof node.type === 'object';
  const isText = typeof node.type === 'string';

  if (isHtmlTag) return true;
  if (isFragment) return node.children?.length > 0;
  if (isComment) return false;
  if (isComponent) return true;
  if (isText) return node.type.length > 0;
  return false;
}
