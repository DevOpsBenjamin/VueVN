import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Dynamically resolve the current project
const currentProject = process.env.VUEVN_PROJECT || '1-beginer-sample';

export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile(), // For production single-file builds
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
      input: path.resolve(__dirname, 'engine.html'), // Engine HTML entry point
    },
  },
});