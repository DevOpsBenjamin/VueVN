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
            <div class="text-2xl text-green-400 font-bold mb-1">0</div>
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

      <!-- Global Events -->
      <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h2 class="text-white text-lg font-semibold mb-4 flex items-center">
          <span class="mr-2">🌍</span>
          Global
        </h2>
        
        <div class="overflow-hidden rounded-lg border border-white/10">
          <table class="w-full">
            <thead class="bg-white/5">
              <tr>
                <th class="px-4 py-3 text-left text-white font-medium text-sm">Location</th>
                <th class="px-4 py-3 text-center text-white font-medium text-sm">Events</th>
                <th class="px-4 py-3 text-center text-white font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover:bg-white/5 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
                    <span class="text-lg">🌐</span>
                    <div>
                      <div class="text-white font-medium text-sm">System Events</div>
                      <div class="text-white/70 text-xs">Non-location specific events</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-blue-400 font-bold">{{ globalLocation.eventCount }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-green-400 font-bold">{{ globalLocation.actionCount }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Locations Overview -->
      <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h2 class="text-white text-lg font-semibold mb-4 flex items-center">
          <span class="mr-2">🗺️</span>
          Locations
        </h2>
        
        <div class="overflow-hidden rounded-lg border border-white/10">
          <table class="w-full">
            <thead class="bg-white/5">
              <tr>
                <th class="px-4 py-3 text-left text-white font-medium text-sm">Location</th>
                <th class="px-4 py-3 text-center text-white font-medium text-sm">Events</th>
                <th class="px-4 py-3 text-center text-white font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="location in locations" :key="location.name" class="hover:bg-white/5 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
                    <span class="text-lg">{{ location.icon }}</span>
                    <div>
                      <div class="text-white font-medium text-sm">{{ location.name }}</div>
                      <div class="text-white/70 text-xs">{{ location.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-blue-400 font-bold">{{ location.eventCount }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-green-400 font-bold">{{ location.actionCount }}</span>
                </td>
              </tr>
              <tr v-if="locations.length === 0" class="hover:bg-white/5">
                <td colspan="3" class="px-4 py-8 text-center text-white/70 text-sm">
                  <div class="flex flex-col items-center space-y-2">
                    <span class="text-2xl opacity-50">📍</span>
                    <span>No locations configured yet</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEditorState } from '@editor/stores/editorState';

const editorState = useEditorState();

// Global location data (system events, cutscenes, etc.)
const globalLocation = ref({
  eventCount: 2,
  actionCount: 5
});

// Mock locations data - will be replaced with real data later
const locations = ref([
  {
    id: 'bedroom',
    name: 'Bedroom',
    icon: '🛏️',
    eventCount: 5,
    actionCount: 12
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: '🍳',
    eventCount: 3,
    actionCount: 8
  },
  {
    id: 'living_room',
    name: 'Living Room',
    icon: '🛋️',
    eventCount: 2,
    actionCount: 6
  },
  {
    id: 'outside',
    name: 'Outside',
    icon: '🌳',
    eventCount: 4,
    actionCount: 10
  }
]);
</script>
