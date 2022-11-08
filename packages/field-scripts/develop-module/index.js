import path from 'path';
import { createRequire } from 'module';
import { createServer } from 'vite';
import createVuePlugin from '@vitejs/plugin-vue';
import envCompatible from 'vite-plugin-env-compatible';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { FM_API_ENDPOINT, FM_SCRIPT_DIR } from 'field-kit-utils/constants.js';
import { snake } from 'field-kit-utils/string-case.js';
import createMockServer from './mock-server.js';

const require = createRequire(import.meta.url);

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
  const cwd = process.cwd();
  const location = path.resolve(cwd, relLocation);
  const { default: config } = await import(location);

  const mockPort = 9000;
  const mockServer = createMockServer(config);
  mockServer.listen(mockPort, 'localhost');

  const fieldKitEntry = require.resolve('field-kit');
  const root = path.dirname(fieldKitEntry);

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
      envCompatible.default(),
    ],
    optimizeDeps: {
      exclude: ['@farmos.org/farmos-map'],
      include: ['axios'],
    },
    server: {
      port,
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
