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

  const pkgSrc = path.resolve(templateRoot, 'package.json');
  const pkgDest = path.resolve(projectRoot, 'package.json');
  const pkgTemplate = JSON.parse(fs.readFileSync(pkgSrc, 'utf-8'));
  const pkgJSON = JSON.stringify({
    name, description, ...pkgTemplate,
  }, null, 2);
  fs.writeFileSync(pkgDest, pkgJSON);

  const configSrc = path.resolve(templateRoot, 'module.config.js');
  const configDest = path.resolve(projectRoot, 'module.config.js');
  const configRaw = fs.readFileSync(configSrc, 'utf-8');
  const config = replaceholders(configRaw);
  fs.writeFileSync(configDest, config);

  const routesSrc = path.resolve(templateRoot, 'src', 'routes.js');
  const routesDest = path.resolve(projectSrc, 'routes.js');
  const routesRaw = fs.readFileSync(routesSrc, 'utf-8');
  const routes = replaceholders(routesRaw);
  fs.writeFileSync(routesDest, routes);

  const containerSrc = path.resolve(templateRoot, 'src', 'Container.vue');
  const containerFilename = `${placeholders._MODULE_NAME_PASCAL_}Container.vue`;
  const containerDest = path.resolve(projectSrc, containerFilename);
  const containerRaw = fs.readFileSync(containerSrc, 'utf-8');
  const container = replaceholders(containerRaw);
  fs.writeFileSync(containerDest, container);

  const widgetSrc = path.resolve(templateRoot, 'src', 'Widget.vue');
  const widgetFilename = `${placeholders._MODULE_NAME_PASCAL_}Widget.vue`;
  const widgetDest = path.resolve(projectSrc, widgetFilename);
  const widgetRaw = fs.readFileSync(widgetSrc, 'utf-8');
  const widget = replaceholders(widgetRaw);
  fs.writeFileSync(widgetDest, widget);

  return results;
}
