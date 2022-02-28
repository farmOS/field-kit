import path from 'path';
import { createServer } from 'vite';
import createVuePlugin from '@vitejs/plugin-vue';
import envCompatible from 'vite-plugin-env-compatible';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { snake } from 'field-kit-utils/string-case.js';
import createMockServer from './mock-server.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const proxyPort = port => ({
  target: `http://localhost:${port}`,
  changeOrigin: true,
  secure: false,
});
const FM_ENDPOINT = '/api/field_module/field_module';
const FM_DIR = '/fieldkit/js';

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

  const root = path.resolve(__dirname, '../../../');

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
    },
    server: {
      port,
      proxy: {
        [FM_ENDPOINT]: proxyPort(9000),
        [`${FM_DIR}/${snake(config.name)}/`]: proxyPort(9000),
        '/api': proxyPort(80),
        '/oauth': proxyPort(80),
        '/fieldkit': proxyPort(80),
      },
      // watch: {
      //   ignored: ['!**/node_modules/field-kit/**'],
      // },
      ...serverOptions,
    },
    ...sharedOptions,
  });
  devServer.watcher.add(cwd);
  await devServer.listen(port);
  devServer.printUrls();
}
