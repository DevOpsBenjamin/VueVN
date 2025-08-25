import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile(), // For production single-file builds
  ],
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, 'engine_src'),
      '@editor': path.resolve(__dirname, 'editor_src'),
      '@projects': path.resolve(__dirname, 'projects'),
      '@generate': path.resolve(__dirname, 'generate'),
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'engine_src/main.ts'), // Engine entry point
    },
  },
});