import { snake } from './string-case.js';

// Field Module constants, which should be moved to shared library where they
// can be accessed by both field-kit and field-scripts.
export const FM_API_ENDPOINT = 'api/field_module/field_module';
export const FM_SCRIPT_DIR = 'fieldkit/js';
export const FM_SCRIPT_FILE = 'index.js';
export const resolveModulePathname = name =>
  `${FM_SCRIPT_DIR}/${snake(name)}/${FM_SCRIPT_FILE}`;
