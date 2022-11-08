import { defineConfig } from 'vite';
import createVuePlugin from '@vitejs/plugin-vue';
import envCompatible from 'vite-plugin-env-compatible';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { VitePWA } from 'vite-plugin-pwa';
import { reduce } from 'ramda';

const proxyConfig = {
  target: 'http://localhost:80',
  changeOrigin: true,
  secure: false,
};

const proxyPaths = reduce((obj, path) => ({ ...obj, [path]: proxyConfig }), {});

// https://vitejs.dev/config/
export default defineConfig({
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
    envCompatible(),
    VitePWA({
      filename: 'service-worker.js',
      manifest: false,
      injectRegister: false,
      workbox: {
        runtimeCaching: [{
          urlPattern: /.*\.(?:js|css)$/,
          handler: 'StaleWhileRevalidate',
        }],
        globIgnores: ['_redirects'],
      },
    }),
  ],
  build: {},
  optimizeDeps: {
    exclude: ['@farmos.org/farmos-map'],
    include: ['axios'],
  },
  server: {
    port: 8080,
    proxy: proxyPaths([
      '/api',
      '/oauth',
      '/fieldkit',
    ]),
  },
});
