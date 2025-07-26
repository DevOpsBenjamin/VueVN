<template>
  <div class="flex h-screen">
    <!-- Explorer de fichiers à gauche -->
    <div
      class="w-1/5 h-full border-r border-gray-800 bg-gray-900 flex flex-col"
    >
      <div class="flex items-center justify-between p-2">
        <span class="text-green-400 font-mono text-xs">Explorer</span>
        <button
          v-if="!previewVisible"
          @click="showPreview"
          class="ml-2 bg-green-700 hover:bg-green-600 text-white rounded px-3 py-1 text-xs shadow"
        >
          Show Preview
        </button>
      </div>
      <!-- TODO: TreeView des fichiers/locations/events du projet -->
    </div>
    <!-- Centre : Monaco Editor + State Inspector -->
    <div class="flex-1 flex flex-col">
      <div class="flex-1 min-h-0">
        <!-- Monaco Editor -->
        <MonacoEditor />
      </div>
      <div class="h-1/3 border-t border-gray-800 bg-gray-950">
        <StateEditorPanel />
      </div>
    </div>
    <!-- Preview runtime flottant -->
    <FloatingGame />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { loadMonaco } from '@/editor/utils/monacoLoader.js';
import MonacoEditor from '@/editor/components/MonacoEditor.vue';
import StateEditorPanel from '@/editor/components/StateEditorPanel.vue';
import FloatingGame from '@/editor/components/FloatingGame.vue';
import { useEditorState } from '@/editor/stores/editorState';
const editorState = useEditorState();
const previewVisible = computed(() => editorState.previewVisible);

function showPreview() {
  editorState.previewVisible = true;
}

onMounted(async () => {
  await loadMonaco();
});
</script>
