const fmtImport = (name, value) =>
  (value ? `import ${name} from '${value}';` : '');

export const fmtCode = ({
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

export const injectStyle = (js, css) => `(function(){
const style = document.createElement('style');
style.type = 'text/css';
style.innerText = ${JSON.stringify(css)};
document.head.appendChild(style);
})();${js}`.replaceAll('\n', '');
