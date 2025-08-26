<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="w-2/3 h-2/3 bg-gray-950 border border-gray-800 rounded flex flex-col">
      <div class="flex-none flex items-center justify-between px-2 py-1 bg-gray-900 border-b border-gray-800">
        <div class="text-blue-400 font-bold">Game State</div>
        <div class="space-x-2">
          <button
            @click="applyGameState"
            class="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs shadow"
          >
            Save
          </button>
          <button
            @click="editorState.showGamePopup = false"
            class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs shadow"
          >
            Close
          </button>
        </div>
      </div>
      <div ref="editorContainer" class="flex-1 min-h-0"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { loadMonaco } from '@editor/utils/monacoLoader.js';
import { gameState as useGameState } from '@generate/stores';
import { useEditorState } from '@editor/stores/editorState';

const editorContainer = ref<HTMLElement | null>(null);
let editorInstance: any = null;
const gameState = useGameState();
const editorJson = ref('');
const editorState = useEditorState();

watch(
  () => JSON.stringify(gameState, null, 2),
  (newVal) => {
    editorJson.value = newVal;
    if (editorInstance && editorInstance.getValue() !== newVal) {
      editorInstance.setValue(newVal);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (editorContainer.value) {
    await loadMonaco();
    editorInstance = window.monaco.editor.create(editorContainer.value, {
      value: editorJson.value,
      language: 'json',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
    });
  }
});

onBeforeUnmount(() => {
  if (editorInstance) editorInstance.dispose();
});

function applyGameState() {
  try {
    const value = editorInstance.getValue();
    const updated = JSON.parse(value);
    if (typeof updated === 'object' && updated !== null) {
      gameState.$patch(updated);
      alert('Game State updated successfully!');
    }
  } catch {
    alert('GameState JSON is invalid!');
  }
}
</script>

