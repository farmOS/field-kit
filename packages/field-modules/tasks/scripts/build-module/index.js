import { resolve } from 'path';
import bundler from './bundler.js';

(async function build(options = {}) {
  const { config = './module.config.js' } = options;
  const cwd = process.cwd();
  const entry = resolve(cwd, config);
  const { default: modConfig } = await import(entry);
  const bundleConfig = { ...modConfig, entry };
  return bundler(bundleConfig);
}());
