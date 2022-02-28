import { resolve } from 'path';
import bundler from './bundler.js';

export default async function build(options = {}) {
  const { config: configLocation = './module.config.js' } = options;
  const cwd = process.cwd();
  const location = resolve(cwd, configLocation);
  const { default: modConfig } = await import(location);
  const bundleConfig = { ...modConfig, location };
  return bundler(bundleConfig);
}
