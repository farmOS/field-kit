import path from 'path';
import { fmtCode, injectStyle } from '../format.js';

const STYLE_BUNDLE = 'style.css';

export default function fieldModulePlugin(pluginOptions = {}) {
  const { entry = path.resolve(process.cwd(), 'module.config.js') } = pluginOptions;
  return {
    name: 'rollup-plugin-field-module',
    enforce: 'post',
    transform(code, id) {
      // Use strict equality between the id and entry path, b/c isEntry is not
      // always reliable. See https://rollupjs.org/guide/en/#thisgetmoduleinfo.
      if (id === entry) {
        return fmtCode(pluginOptions);
      }
      return code;
    },
    generateBundle(_, bundle) {
      try {
        const js = bundle[pluginOptions.fileName()];
        const css = bundle[STYLE_BUNDLE];
        if (css) js.code = injectStyle(js.code, css.source);
        delete bundle[STYLE_BUNDLE];
      } catch (error) {
        const msg = `Error injecting styles for ${pluginOptions.name} module: `;
        console.error(msg, error); // eslint-disable-line no-console
      }
    },
  };
}
