<template>
  <div class="h-full flex flex-col bg-black/10">
    <div class="flex-1 overflow-y-auto">
      <div class="p-6 space-y-6">
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
                      <div class="text-white font-medium text-sm">System</div>
                      <div class="text-white/70 text-xs">Non-location specific</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-blue-400 font-bold">{{ globalStats.eventCount }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-green-400 font-bold">{{ globalStats.actionCount }}</span>
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
              <tr v-for="location in locationsArray" :key="location.name" class="hover:bg-white/5 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
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
              <tr v-if="locationsArray.length === 0" class="hover:bg-white/5">
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
import projectData from '@generate/project';
import { useEditorState } from '@editor/stores/editorState';
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
