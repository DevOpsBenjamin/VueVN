<template>
  <header class="bg-black/20 backdrop-blur-sm border-b border-white/10">
    <div class="flex items-center px-6 py-4">
      <!-- Left Section: Project Name -->
      <div class="flex items-center space-x-2 flex-shrink-0">
        <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">VN</span>
        </div>
        <h1 class="text-white font-semibold text-xl">{{ projectData.config.name }}</h1>
      </div>

      <!-- Center Section: Navigation -->
      <div class="flex-1 flex items-center justify-center">
        <nav class="flex space-x-2">
          <!-- Dashboard Button -->
          <button
            @click="setModule('dashboard')"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all duration-200',
              editorState.activeModule === 'dashboard'
                ? 'bg-white/20 text-white shadow-lg ring-2 ring-white/20'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            ]"
            style="font-size: 1vw;"
          >
            <span class="mr-2">📊</span>
            Dashboard
          </button>

          <!-- Location Navigation -->
          <div class="flex space-x-1">
            <!-- Current Location or Location List -->
            <button
              v-if="!editorState.selectedLocation"
              @click="setModule('locationManager')"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                editorState.activeModule === 'locationManager'
                  ? 'bg-white/20 text-white shadow-lg ring-2 ring-white/20'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              ]"
              style="font-size: 1vw;"
            >
              <span class="mr-2">🗺️</span>
              Locations
            </button>

            <!-- Selected Location with Submenu -->
            <div v-else class="flex items-center space-x-2">
              <!-- Back Button -->
              <button
                @click="backToLocationList"
                class="flex items-center space-x-1 px-3 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                style="font-size: 1vw;"
              >
                <span>←</span>
                <span>🗺️</span>
              </button>
              
              <!-- Current Location Name -->
              <div class="px-4 py-2 rounded-lg font-medium bg-blue-500/20 text-blue-300 ring-2 ring-blue-500/50" style="font-size: 1vw;">
                <span class="mr-2">📍</span>
                {{ editorState.selectedLocation }}
              </div>
              
              <!-- Location Tabs -->
              <button
                v-for="tab in locationTabs"
                :key="tab.id"
                @click="setLocationTab(tab.id)"
                :class="[
                  'px-3 py-2 rounded-lg font-medium transition-all duration-200',
                  editorState.activeLocationTab === tab.id
                    ? 'bg-white/20 text-white shadow-lg ring-2 ring-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                ]"
                style="font-size: 1vw;"
              >
                <span class="mr-1">{{ tab.icon }}</span>
                {{ tab.name }}
              </button>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Right Section: State Buttons -->
      <div class="flex items-center space-x-3 flex-shrink-0">
        <!-- Preview Button -->
        <button
          @click="togglePreview"
          :class="[
            'px-3 py-1.5 rounded-md font-medium transition-all duration-200',
            editorState.previewVisible
              ? 'bg-purple-500/30 text-purple-300 ring-2 ring-purple-500/50'
              : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300'
          ]"
          style="font-size: 0.9vw;"
        >
          {{ editorState.previewVisible ? '👁️ Hide Preview' : '👁️ Preview' }}
        </button>
        
        <!-- State Management Buttons -->
        <button
          @click="editorState.showEnginePopup = true"
          class="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-md font-medium transition-all duration-200"
          style="font-size: 0.9vw;"
        >
          🔧 Engine
        </button>
        <button
          @click="editorState.showGamePopup = true"
          class="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-md font-medium transition-all duration-200"
          style="font-size: 0.9vw;"
        >
          🎮 Game
        </button>
        
        <!-- Reset Button -->
        <button
          @click="resetAll"
          class="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-md font-medium transition-all duration-200"
          style="font-size: 0.9vw;"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { getActivePinia } from 'pinia';
import { useEditorState } from '@editor/stores/editorState';
import projectData from '@generate/project';

const editorState = useEditorState();

// Location tabs configuration
const locationTabs = [
  { id: 'events', name: 'Events', icon: '📅' },
  { id: 'actions', name: 'Actions', icon: '⚡' },
  { id: 'images', name: 'Images', icon: '🖼️' },
  { id: 'sounds', name: 'Sounds', icon: '🔊' },
  { id: 'texts', name: 'Texts', icon: '📝' }
];

function togglePreview() {
  editorState.previewVisible = !editorState.previewVisible;
}

function setModule(name: string) {
  editorState.activeModule = name;
  // Clear location selection when going to dashboard
  if (name === 'dashboard') {
    editorState.selectedLocation = null;
  }
}

function setLocationTab(tabId: string) {
  editorState.activeLocationTab = tabId;
}

function backToLocationList() {
  editorState.selectedLocation = null;
  editorState.activeModule = 'locationManager';
  editorState.activeLocationTab = 'events'; // Reset to default tab
}

function resetAll() {
  const pinia = getActivePinia() as any;
  pinia?._s.forEach((store: any) => {
    if (store.$id === "editorState") {
      return; // Use return instead of continue in forEach
    }
    console.log(`Store name: ${store.$id} cleared`);
    store.$reset();
  });
}
</script>