import path from 'path';
import { snake } from '../../namespaces/index.js';

const fmtImport = (name, value) =>
  (value ? `import ${name} from '${value}';` : '');

export const fmtCode = ({
  name, label, description, routes, widget,
}) => `
${fmtImport('routes', routes)}
${fmtImport('widget', widget)}

window.lib.mountFieldModule({
  name: '${name}',
  label: '${label}',
  description: '${description}',
  widget: ${widget && 'widget'},
  routes: ${routes && 'routes'},
});`.trim();

export const injectStyle = (js, css) => `(function(){
const style = document.createElement('style');
style.type = 'text/css';
style.innerText = ${JSON.stringify(css)};
document.head.appendChild(style);
})();${js}`.replaceAll('\n', '');

const absPath = relPath => path.resolve(process.cwd(), relPath);
export const fmtScript = config => fmtCode({
  ...config,
  routes: config.routes && absPath(config.routes),
  widget: config.widget && absPath(config.widget),
});

const fmtModuleData = ({ name, label, description } = {}) => ({
  type: 'field_module--field_module',
  id: '00000000-0000-0000-0000-000000000000',
  links: {
    self: {
      href: 'http://localhost:9000/api/field_module/field_module/00000000-0000-0000-0000-000000000000',
    },
  },
  attributes: {
    langcode: 'en',
    status: true,
    dependencies: {
      enforced: {
        module: [
          `farm_fieldkit_${snake(name)}`,
        ],
      },
    },
    drupal_internal__id: snake(name),
    label,
    description,
    library: `farm_fieldkit_${snake(name)}/${snake(name)}`,
  },
});

export const fmtJsonApi = config => ({
  jsonapi: {
    version: '1.0',
    meta: {
      links: {
        self: {
          href: 'http://jsonapi.org/format/1.0/',
        },
      },
    },
  },
  data: Array.isArray(config) ? config.map(fmtModuleData) : [fmtModuleData(config)],
  links: {
    self: {
      href: 'https://localhost:9000/api/field_module/field_module',
    },
  },
});
