import path from 'path';

const fmtImport = (name, value) =>
  (value ? `import ${name} from '${value}';` : '');
const fmtCode = ({
  name, label, description, routes, widget,
}) => `
${fmtImport('routes', routes)}
${fmtImport('widget', widget)}

window.farmOS.mountFieldModule({
  name: '${name}',
  label: '${label}',
  description: '${description}',
  widget: ${widget && 'widget'},
  routes: ${routes && 'routes'},
});`.trim();

export default function fieldModulePlugin(pluginOptions = {}) {
  const { entry = path.resolve(process.cwd(), 'module.config.js') } = pluginOptions;
  return {
    name: 'rollup-plugin-field-module',
    transform(code, id) {
      // Use strict equality between the id and entry path, b/c isEntry is not
      // always reliable. See https://rollupjs.org/guide/en/#thisgetmoduleinfo.
      if (id === entry) {
        return fmtCode(pluginOptions);
      }
      return code;
    },
  };
}
