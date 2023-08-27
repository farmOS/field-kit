import fs from 'node:fs';
import path from 'node:path';
import prompts from 'prompts';

// Capitalize the first letter of every word, preserving all whitespace and
// punctuation except for underscores and hyphens.
export const title = str => str
  .replaceAll(/_+|-+/g, ' ')
  .replace(/\w+\b/g, w => w.slice(0, 1).toUpperCase() + w.slice(1));

// Convert any kebab-case, snake_case or plain phrases containing whitespace or
// punctuation into PascalCase, preserving already-capitalized characters.
export const pascal = str => title(str).replaceAll(/\W+/g, '');

// This differs from the version of kebab in field-kit-utils/string-case.js,
// which is only intended for converting PascalCase Vue component names into
// kebab-case, but it doesn't handle whitespace and other deviations very well.
const kebab = str => title(str).toLowerCase().replaceAll(/\s+/g, '-');

// Read a template file, transform it somehow, write the new file.
function castTemplate({ src, dest, transform }) {
  const srcPath = path.resolve(...[src].flat());
  const destPath = path.resolve(...[dest].flat());
  let content = fs.readFileSync(srcPath, 'utf-8');
  if (typeof transform === 'function') content = transform(content);
  fs.writeFileSync(destPath, content);
}

export default async function create(projectName = '') {
  const results = await prompts([
    {
      name: 'moduleName',
      type: 'text',
      message: 'Module name (kebab-case):',
      initial: projectName,
      validate: str => str.length > 2
        || 'The module name must be 3 valid characters or more.',
    },
    {
      name: 'moduleLabel',
      type: 'text',
      message: 'Module label to display in the UI:',
      initial: title,
    },
    {
      name: 'description',
      type: 'text',
      message: 'Description:',
      initial: '',
    },
  ]);

  const {
    moduleName, moduleLabel, description,
  } = results;
  const name = kebab(moduleName);

  const placeholders = {
    _MODULE_NAME_KEBAB_: name,
    _MODULE_LABEL_: moduleLabel,
    _MODULE_DESCIPTION_: description,
    _MODULE_NAME_PASCAL_: pascal(name),
  };
  const replaceholders = filestring => Object.entries(placeholders)
    .reduce((prev, [ph, val]) => prev.replaceAll(ph, val), filestring);

  const templateRoot = new URL('./template', import.meta.url).pathname;
  const projectRoot = path.join(process.cwd(), name);
  const projectSrc = path.join(projectRoot, 'src');
  fs.mkdirSync(projectRoot);
  fs.mkdirSync(projectSrc);

  castTemplate({
    src: [templateRoot, 'package.json'],
    dest: [projectRoot, 'package.json'],
    transform: pkg => JSON.stringify({
      name, description, ...JSON.parse(pkg),
    }, null, 2),
  });

  castTemplate({
    src: [templateRoot, 'module.config.js'],
    dest: [projectRoot, 'module.config.js'],
    transform: replaceholders,
  });

  castTemplate({
    src: [templateRoot, 'src', 'routes.js'],
    dest: [projectSrc, 'routes.js'],
    transform: replaceholders,
  });

  castTemplate({
    src: [templateRoot, 'src', 'Container.vue'],
    dest: [projectSrc, `${placeholders._MODULE_NAME_PASCAL_}Container.vue`],
    transform: replaceholders,
  });

  castTemplate({
    src: [templateRoot, 'src', 'Widget.vue'],
    dest: [projectSrc, `${placeholders._MODULE_NAME_PASCAL_}Widget.vue`],
    transform: replaceholders,
  });

  return results;
}
