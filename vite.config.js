import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';
import viteApiPlugin from './vite-plugins/api.ts';
import serveStatic from 'serve-static';

// Dynamically resolve the current project for @assets alias
const currentProject = process.env.VUEVN_PROJECT || 'sample';

export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile(),
    viteApiPlugin(),
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
