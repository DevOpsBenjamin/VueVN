import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { setupDevApi } from './dev_src/index.js';
import serveStatic from 'serve-static';

// Dynamically resolve the current project for @assets alias
const currentProject = process.env.VUEVN_PROJECT || 'sample';

export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile(),
    {
      name: 'dev-api',
      configureServer(server) {
        if (process.env.NODE_ENV === 'development') {
          setupDevApi(server.middlewares);
        }
      },
    },
    {
      name: 'serve-project-assets',
      configureServer(server) {
        const assetsPath = path.resolve(
          __dirname,
          'projects',
          currentProject,
          'assets'
        );
        server.middlewares.use('/assets', serveStatic(assetsPath));
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
