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
        const projectPath = path.resolve(__dirname, 'projects', currentProject);
        
        // Serve global assets directly at /global/*
        server.middlewares.use('/global', serveStatic(path.join(projectPath, 'global')));
        // Dynamic location serving: /:locationId/* -> projects/.../locations/:locationId/* if exists
        server.middlewares.use((req, res, next) => {
          try {
            if (!req.url) return next();
            const url = new URL(req.url, 'http://localhost');
            const parts = url.pathname.split('/').filter(Boolean);
            if (parts.length >= 2) {
              const loc = parts[0];
              const rest = parts.slice(1).join('/');
              const tryPath = path.join(projectPath, 'locations', loc, rest);
              // Only serve if it's a file
              if (require('fs').existsSync(tryPath) && require('fs').statSync(tryPath).isFile()) {
                return serveStatic(path.dirname(tryPath))(Object.assign(req, { url: '/' + path.basename(tryPath) }), res, next);
              }
            }
          } catch {}
          next();
        });
      },
    },
  ],
  publicDir: 'public', // Ensure public directory is served
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
      input: path.resolve(__dirname, 'index.html'), // Main HTML entry point
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
