/**
 * This duplicates some of the functions in src/core/fieldModules.js, which
 * should be moved into packages/shared-utils or some such location, along with
 * src/core/utils, when the time comes.
 */

// Convert camelCase or PascalCase to kebab-case, then snake_case, based on:
// https://stackoverflow.com/a/67243723/1549703.
const kebabReplacer = (match, offset) =>
  (offset ? '-' : '') + match.toLowerCase();
const kebabRegex = /[A-Z]+(?![a-z])|[A-Z]/g;
export const kebab = str => str.replace(kebabRegex, kebabReplacer);
export const snake = str => kebab(str).replaceAll('-', '_');
