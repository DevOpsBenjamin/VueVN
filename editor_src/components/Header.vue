<template>
  <div class="p-4 bg-gray-900 border-b border-gray-800 text-gray-100">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-bold">{{ project.name || 'No project loaded' }}</h1>
      <div class="space-x-2">
        <button
          @click="togglePreview"
          class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Preview
        </button>
        <button
          class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          @click="editorState.showEnginePopup = true"
        >
          Engine State
        </button>
        <button
          class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          @click="editorState.showGamePopup = true"
        >
          Game State
        </button>
        <button
          class="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          @click="resetAll"
        >
          Reset Stores
        </button>
      </div>
    </div>
    <div class="mt-2 space-x-2">
      <button
        class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
        @click="setModule('dashboard')"
      >
        Dashboard
      </button>
      <button
        class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
        @click="setModule('locationManager')"
      >
        Location Manager
      </button>
      <button
        class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
        @click="setModule('assetManager')"
      >
        Asset Manager
      </button>
      <button
        class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
        @click="setModule('localizationManager')"
      >
        Localization Manager
      </button>
      <button
        class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
        @click="setModule('projectEditor')"
      >
        Action Editor
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getActivePinia } from 'pinia';
import { useEditorState } from '@editor/stores/editorState';

const editorState = useEditorState();
const project = ref<{ name?: string }>({});

onMounted(async () => {
  try {
    const res = await fetch('/projects/2-advance-sample/config.json');
    project.value = await res.json();
  } catch (err) {
    console.error('Failed to load project config', err);
  }
});

function togglePreview() {
  editorState.previewVisible = !editorState.previewVisible;
}

function setModule(name: string) {
  editorState.activeModule = name;
}

function resetAll() {
  const pinia = getActivePinia() as any;
  pinia?._s.forEach((store: any) => {
    store.$reset();
  });
}
</script>

