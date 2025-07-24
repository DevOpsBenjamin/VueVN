import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { setupDevApi } from './dev_src/index.js';

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
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
