import fs from 'fs';
import path from 'path';
import { build } from 'vite';
import createVuePlugin from '@vitejs/plugin-vue';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import jsYaml from 'js-yaml';
import { snake } from '../../namespaces/string-case.js';
import fieldModulePlugin from './rollup-plugin-field-module.js';

const writeYaml = (filepath, data) => {
  const yaml = jsYaml.dump(data);
  fs.writeFileSync(filepath, yaml);
};

const pkgPath = path.resolve(process.cwd(), './package.json');
const json = fs.readFileSync(pkgPath);
const { version } = JSON.parse(json);

export default async function bundler(config) {
  const {
    name, label, description, location,
  } = config;
  const fileName = () => `${name}.${version.replaceAll('.', '-')}.js`;
  const drupalName = `farm_fieldkit_${snake(name)}`;

  return build({
    outDir: `dist/${drupalName}/js`,
    resolve: {
      extensions: [
        '.mjs',
        '.js',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
        '.vue',
      ],
    },
    plugins: [
      createVuePlugin({ jsx: true }),
      viteCommonjs(),
      fieldModulePlugin({ ...config, fileName }),
    ],
    build: {
      lib: {
        entry: location,
        name,
        fileName,
        formats: ['umd'],
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          dir: `dist/${drupalName}/js`,
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  }).then((bundle) => {
    const infoPath = `dist/${drupalName}/${drupalName}.info.yml`;
    const info = {
      name: `farmOS Field Kit ${label}`,
      description,
      type: 'module',
      package: 'farmOS',
      core_version_requirement: '^9',
      dependencies: ['farm:farm_fieldkit'],
    };
    writeYaml(infoPath, info);

    const libName = `${snake(name)}`;
    const libPath = `dist/${drupalName}/${drupalName}.libraries.yml`;
    const lib = {
      [libName]: {
        js: {
          [`js/${fileName()}`]: { preprocess: false },
        },
      },
    };
    writeYaml(libPath, lib);

    fs.mkdirSync(`dist/${drupalName}/config/install`, { recursive: true });
    const installPath = `dist/${drupalName}/config/install/farm_fieldkit.field_module.${snake(name)}.yml`;
    const install = {
      langcode: 'en',
      status: true,
      dependencies: { enforced: { module: [drupalName] } },
      id: name,
      label,
      description,
      library: `${drupalName}/${libName}`,
    };
    writeYaml(installPath, install);

    return {
      bundle: {
        location: `dist/${drupalName}/js/${fileName()}`,
        contents: bundle,
      },
      info: {
        location: infoPath,
        contents: info,
      },
      install: {
        location: installPath,
        contents: install,
      },
      lib: {
        location: libPath,
        contents: install,
      },
    };
  });
}
