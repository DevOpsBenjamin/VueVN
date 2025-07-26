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
import { loadMonaco } from '@/editor/utils/monacoLoader.js';
import { onMounted, ref, onBeforeUnmount } from 'vue';
let editorInstance = null;
const editorContainer = ref(null);

onMounted(async () => {
  await loadMonaco();
  editorInstance = window.monaco.editor.create(editorContainer.value, {
    value: '// Commence à écrire ton event ici\n\nTEMPALTE FUTUR\n',
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
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
