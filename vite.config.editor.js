import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import viteApiPlugin from './vite-plugins/api.ts';
import serveStatic from 'serve-static';
import vueDevTools from 'vite-plugin-vue-devtools';

// Dynamically resolve the current project
const currentProject = process.env.VUEVN_PROJECT || '1-beginer-sample';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    viteApiPlugin(), // File API plugin for editor
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
      '@engine': path.resolve(__dirname, 'engine_src'),
      '@editor': path.resolve(__dirname, 'editor_src'),
      '@project': path.resolve(__dirname, 'projects', currentProject),
      '@generate': path.resolve(__dirname, 'generate'),
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'editor.html'), // Editor HTML entry point
    },
  },
  server: {
    host: true, // 0.0.0.0 so it's reachable in Docker
    port: 5173,
    strictPort: true,
    allowedHosts: ['dev.jetdail.fr'],
    hmr: {
      host: 'dev.jetdail.fr',
      protocol: 'wss',
      clientPort: 443,
    },
  },
});
