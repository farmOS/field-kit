import { resolveModulePathname } from 'field-kit-utils/constants';
import { getHost } from '../remote';

// Takes module info from the API and uses it to inject a script tag and run
// a module's main entry file (eg, module.js).
export default function importFieldModule({ name }) {
  return new Promise((resolve, reject) => {
    const id = `field-module-${name}`;
    const prev = document.getElementById(id);
    if (prev !== null) { prev.remove(); }
    const script = document.createElement('script');
    script.id = id;
    script.src = `${getHost()}/${resolveModulePathname(name)}`;
    script.type = 'module';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}
