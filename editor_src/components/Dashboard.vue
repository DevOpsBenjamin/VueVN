<template>
  <div class="h-full flex flex-col bg-black/10">
    <div class="flex-1 overflow-y-auto">
      <div class="p-6 space-y-6">
      <!-- Welcome Section -->
      <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold">🎮</span>
          </div>
          <div>
            <h2 class="text-white text-xl font-semibold">Welcome to VueVN Editor</h2>
            <p class="text-white/70 text-sm">Create amazing visual novels with TypeScript and Vue</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white/5 rounded-lg p-4 border border-white/5">
            <h3 class="text-white font-medium mb-2">🗺️ Location-Centric</h3>
            <p class="text-white/70 text-sm">Organize content by locations for complex sandbox games</p>
          </div>
          <div class="bg-white/5 rounded-lg p-4 border border-white/5">
            <h3 class="text-white font-medium mb-2">🌍 Multilingual</h3>
            <p class="text-white/70 text-sm">Built-in i18n system with translation workflow tools</p>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h2 class="text-white text-lg font-semibold mb-4 flex items-center">
          <span class="mr-2">⚡</span>
          Quick Actions
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            @click="editorState.activeModule = 'assetManager'"
            class="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 rounded-lg border border-white/10 transition-all duration-200"
          >
            <span class="text-2xl">🖼️</span>
            <div class="text-left">
              <div class="text-white font-medium text-sm">Manage Assets</div>
              <div class="text-white/70 text-xs">Images & audio files</div>
            </div>
          </button>
          
          <button
            @click="editorState.activeModule = 'locationManager'"
            class="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 rounded-lg border border-white/10 transition-all duration-200"
          >
            <span class="text-2xl">🗺️</span>
            <div class="text-left">
              <div class="text-white font-medium text-sm">Edit Locations</div>
              <div class="text-white/70 text-xs">Game world setup</div>
            </div>
          </button>
          
          <button
            @click="editorState.activeModule = 'localizationManager'"
            class="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg border border-white/10 transition-all duration-200"
          >
            <span class="text-2xl">🌍</span>
            <div class="text-left">
              <div class="text-white font-medium text-sm">Translations</div>
              <div class="text-white/70 text-xs">Multilingual support</div>
            </div>
          </button>
        </div>
      </section>

      <!-- Project Status -->
      <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h2 class="text-white text-lg font-semibold mb-4 flex items-center">
          <span class="mr-2">📊</span>
          Project Overview
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-white/5 rounded-lg border border-white/5">
            <div class="text-2xl text-green-400 font-bold mb-1">{{ locationsArray.length }}</div>
            <div class="text-white/70 text-sm">Locations</div>
          </div>
          <div class="text-center p-4 bg-white/5 rounded-lg border border-white/5">
            <div class="text-2xl text-purple-400 font-bold mb-1">0</div>
            <div class="text-white/70 text-sm">Assets</div>
          </div>
          <div class="text-center p-4 bg-white/5 rounded-lg border border-white/5">
            <div class="text-2xl text-orange-400 font-bold mb-1">1</div>
            <div class="text-white/70 text-sm">Languages</div>
          </div>
        </div>
      </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorState } from '@editor/stores/editorState';
import projectData from '@generate/project';

const editorState = useEditorState();

// Calculate global events and actions count
const globalStats = {
  eventCount: Object.keys(projectData.global.events).length,
  actionCount: Object.keys(projectData.global.actions).length
};

// Convert locations record to array with stats and icons
const locationsArray = Object.entries(projectData.locations).map(([id, locationData]) => ({
    id,
    name: locationData.info!.name,
    eventCount: Object.keys(locationData.events).length,
    actionCount: Object.keys(locationData.actions).length
  }));
</script>
