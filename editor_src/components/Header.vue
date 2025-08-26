<template>
  <header class="bg-black/20 backdrop-blur-sm border-b border-white/10">
    <div class="flex items-center justify-between px-6 py-3">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">VN</span>
          </div>
          <h1 class="text-white font-semibold text-lg">{{ project.name || 'VueVN Editor' }}</h1>
        </div>
        <div class="h-6 w-px bg-white/20"></div>
        <nav class="flex space-x-1">
          <button
            v-for="module in modules"
            :key="module.key"
            @click="setModule(module.key)"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              editorState.activeModule === module.key
                ? 'bg-white/20 text-white shadow-lg ring-2 ring-white/20'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            ]"
          >
            <span class="mr-2">{{ module.icon }}</span>
            {{ module.label }}
          </button>
        </nav>
      </div>
      
      <div class="flex items-center space-x-3">
        <!-- Preview Button -->
        <button
          @click="togglePreview"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
            editorState.previewVisible
              ? 'bg-purple-500/30 text-purple-300 ring-2 ring-purple-500/50'
              : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300'
          ]"
        >
          {{ editorState.previewVisible ? '👁️ Hide Preview' : '👁️ Preview' }}
        </button>
        
        <!-- State Management Buttons -->
        <button
          @click="editorState.showEnginePopup = true"
          class="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-md text-sm font-medium transition-all duration-200"
        >
          🔧 Engine
        </button>
        <button
          @click="editorState.showGamePopup = true"
          class="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-md text-sm font-medium transition-all duration-200"
        >
          🎮 Game
        </button>
        
        <!-- Reset Button -->
        <button
          @click="resetAll"
          class="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-md text-sm font-medium transition-all duration-200"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getActivePinia } from 'pinia';
import { useEditorState } from '@editor/stores/editorState';

const editorState = useEditorState();
const project = ref<{ name?: string }>({});

const modules = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'assetManager', label: 'Assets', icon: '🖼️' },
  { key: 'locationManager', label: 'Locations', icon: '🗺️' },
  { key: 'localizationManager', label: 'i18n', icon: '🌍' }
];

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