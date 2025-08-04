<template>
  <div
    class="flex flex-row h-full p-2 space-x-6 bg-gray-950 text-xs text-white"
  >
    <!-- Engine State Editor -->
    <div
      class="flex flex-col flex-1 border border-gray-800 rounded overflow-hidden"
    >
      <div
        class="flex-none flex items-center justify-between px-2 py-1 bg-gray-900 border-b border-gray-800"
      >
        <div class="text-green-400 font-bold">Engine State</div>
        <button
          @click="applyEngineState"
          class="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs shadow"
        >
          Save Engine State
        </button>
      </div>
      <div ref="engineEditorContainer" class="flex-1 min-h-0"></div>
    </div>

    <!-- Game State Editor -->
    <div
      class="flex flex-col flex-1 border border-gray-800 rounded overflow-hidden"
    >
      <div
        class="flex-none flex items-center justify-between px-2 py-1 bg-gray-900 border-b border-gray-800"
      >
        <div class="text-blue-400 font-bold">Game State</div>
        <button
          @click="applyGameState"
          class="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs shadow"
        >
          Save Game State
        </button>
      </div>
      <div ref="gameEditorContainer" class="flex-1 min-h-0"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

// Editor container refs
const engineEditorContainer = ref(null);
const gameEditorContainer = ref(null);

let engineEditorInstance = null;
let gameEditorInstance = null;

// Simulated composables
import {
  engineState as useEngineState,
  gameState as useGameState,
} from '@/generate/stores';

const engineState = useEngineState();
const gameState = useGameState();

// Load Monaco Editor
function loadMonaco() {
  return new Promise((resolve) => {
    if (window.monaco) return resolve();

    const script = document.createElement('script');
    script.src =
      'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
    script.onload = () => {
      window.require.config({
        paths: {
          vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs',
        },
      });
      resolve();
    };
    document.body.appendChild(script);
  });
}

async function createEditor(container, initialValue, language = 'json') {
  await loadMonaco();

  return new Promise((resolve) => {
    window.require(['vs/editor/editor.main'], () => {
      const editor = window.monaco.editor.create(container, {
        value: initialValue,
        language,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
      });
      resolve(editor);
    });
  });
}

// Keep JSON in sync with state
const engineJson = ref('');
const gameJson = ref('');

watch(
  () => JSON.stringify(engineState, null, 2),
  (newVal) => {
    engineJson.value = newVal;
    if (engineEditorInstance) {
      const currentValue = engineEditorInstance.getValue();
      if (currentValue !== newVal) {
        engineEditorInstance.setValue(newVal);
      }
    }
  },
  { immediate: true }
);

watch(
  () => JSON.stringify(gameState, null, 2),
  (newVal) => {
    gameJson.value = newVal;
    if (gameEditorInstance) {
      const currentValue = gameEditorInstance.getValue();
      if (currentValue !== newVal) {
        gameEditorInstance.setValue(newVal);
      }
    }
  },
  { immediate: true }
);

onMounted(async () => {
  engineEditorInstance = await createEditor(
    engineEditorContainer.value,
    JSON.stringify(engineState, null, 2)
  );
  gameEditorInstance = await createEditor(
    gameEditorContainer.value,
    JSON.stringify(gameState, null, 2)
  );
});

onBeforeUnmount(() => {
  if (engineEditorInstance) engineEditorInstance.dispose();
  if (gameEditorInstance) gameEditorInstance.dispose();
});

// Patch state from editor content
function applyEngineState() {
  try {
    const value = engineEditorInstance.getValue();
    const updated = JSON.parse(value);
    if (typeof updated === 'object' && updated !== null) {
      engineState.$patch(updated);
      alert('Engine State updated successfully!');
    }
  } catch {
    alert('EngineState JSON is invalid!');
  }
}

function applyGameState() {
  try {
    const value = gameEditorInstance.getValue();
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
