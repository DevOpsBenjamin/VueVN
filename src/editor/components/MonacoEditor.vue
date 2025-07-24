<template>
  <div
    class="h-full w-full flex flex-col bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800"
  >
    <div
      class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700"
    >
      <span class="font-mono text-green-400 text-sm">Event Editor</span>
      <button
        class="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 rounded text-white"
      >
        Save
      </button>
    </div>
    <div class="flex-1 relative">
      <div ref="editorContainer" class="absolute inset-0" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
let editorInstance = null;
const editorContainer = ref(null);
const isDev = import.meta.env.DEV;

onMounted(async () => {
  if (!isDev) return;
  // Charger Monaco via CDN si pas déjà présent
  if (!window.monaco) {
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
    window.require.config({
      paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs',
      },
    });
  }
  window.require(['vs/editor/editor.main'], () => {
    editorInstance = window.monaco.editor.create(editorContainer.value, {
      value: '// Commence à écrire ton event ici\n',
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
    });
  });
});

onBeforeUnmount(() => {
  if (editorInstance) editorInstance.dispose();
});
</script>

<style scoped>
.h-full {
  height: 100%;
}
.w-full {
  width: 100%;
}
</style>
