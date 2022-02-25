/**
 * This duplicates some of the functions in src/core/fieldModules.js, which
 * should be moved into packages/shared-utils or some such location, along with
 * src/core/utils, when the time comes.
 */

// Convert PascalCase & camelCase to kebab-case (or snake_case), based on:
// https://stackoverflow.com/a/67243723/1549703.
const pascalRegex = /[A-Z]+(?![a-z])|[A-Z]/g;
const kebabReplacer = (match, offset) =>
  (offset ? '-' : '') + match.toLowerCase();
export const kebab = str => str.replace(pascalRegex, kebabReplacer).replaceAll('_', '-');
const snakeReplacer = (match, offset) =>
  (offset ? '_' : '') + match.toLowerCase();
export const snake = str => str.replace(pascalRegex, snakeReplacer).replaceAll('-', '_');
