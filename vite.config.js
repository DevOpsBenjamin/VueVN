import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { setupDevApi } from './dev-api.js';
import { viteSingleFile } from 'vite-plugin-singlefile'; // correction import

export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile(), // correction ici
    {
      name: 'dev-api',
      configureServer(server) {
        if (process.env.NODE_ENV === 'development') {
          setupDevApi(server.middlewares);
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
