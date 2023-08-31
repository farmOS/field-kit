import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import createVuePlugin from '@vitejs/plugin-vue';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { FM_API_ENDPOINT, FM_SCRIPT_DIR, snake } from '../../../namespaces/index.js';
import createMockServer from './mock-server.js';

// The current working directory of the downstream application, which will call
// `npm run field-scripts develop`.
const cwd = process.cwd();
// The root path of this, the @farmos.org/field-kit package itself, which may be
// under the node_modules of the cwd.
const root = fileURLToPath(new URL('../../..', import.meta.url));

/**
 * Explicitly use strict mode on the file system (already Vite's default), but
 * also add both the root and the cwd to the allow list. Vite will only include
 * the root by default, not the cwd.
 * @see https://vitejs.dev/config/server-options.html#server-fs-allow
 */
const fs = {
  strict: true,
  allow: [cwd, root],
};

const proxyPort = port => ({
  target: `http://localhost:${port}`,
  changeOrigin: true,
  secure: false,
});

export default async function develop(options = {}) {
  const {
    config: relLocation = './module.config.js',
    server: {
      port = 8080,
      ...serverOptions
    } = {},
    ...sharedOptions
  } = options;
  const location = path.resolve(cwd, relLocation);
  const { default: config } = await import(location);

  const mockPort = 9000;
  const mockServer = createMockServer(config);
  mockServer.listen(mockPort, 'localhost');

  const devServer = await createServer({
    root,
    configFile: false,
    resolve: {
      alias: [
        {
          find: 'vue',
          replacement: 'vue/dist/vue.esm-bundler.js',
        },
      ],
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
    ],
    optimizeDeps: {
      exclude: ['@farmos.org/farmos-map'],
      include: ['axios'],
    },
    server: {
      port,
      fs,
      proxy: {
        [`/${FM_API_ENDPOINT}`]: proxyPort(9000),
        [`/${FM_SCRIPT_DIR}/${snake(config.name)}/`]: proxyPort(9000),
        '/api': proxyPort(80),
        '/oauth': proxyPort(80),
        '/fieldkit': proxyPort(80),
      },
      ...serverOptions,
    },
    ...sharedOptions,
  });
  devServer.watcher.add(cwd);
  await devServer.listen(port);
  devServer.printUrls();
}
