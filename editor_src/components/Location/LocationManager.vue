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
                <th class="px-4 py-3 text-center text-white font-medium text-sm w-32">Manage</th>
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
                <td class="px-4 py-3 text-center">
                  <button
                    @click="editLocation('global')"
                    class="inline-flex items-center space-x-1 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded border border-orange-500/30 text-orange-400 text-xs transition-all duration-200"
                  >
                    <span>✏️</span>
                    <span>Edit</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Locations Overview -->
      <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-white text-lg font-semibold flex items-center">
            <span class="mr-2">🗺️</span>
            Locations
          </h2>
          <button
            @click="addNewLocation"
            class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-lg border border-white/20 transition-all duration-200 text-white"
          >
            <span class="text-lg">➕</span>
            <span class="font-medium">Add Location</span>
          </button>
        </div>
        
        <div class="overflow-hidden rounded-lg border border-white/10">
          <table class="w-full">
            <thead class="bg-white/5">
              <tr>
                <th class="px-4 py-3 text-left text-white font-medium text-sm">Location</th>
                <th class="px-4 py-3 text-center text-white font-medium text-sm">Events</th>
                <th class="px-4 py-3 text-center text-white font-medium text-sm">Actions</th>
                <th class="px-4 py-3 text-center text-white font-medium text-sm w-32">Manage</th>
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
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center space-x-2">
                    <button
                      @click="editLocation(location.id)"
                      class="inline-flex items-center space-x-1 px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded border border-orange-500/30 text-orange-400 text-xs transition-all duration-200"
                    >
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>
                    <button
                      @click="deleteLocation(location.id)"
                      class="inline-flex items-center space-x-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/30 text-red-400 text-xs transition-all duration-200"
                    >
                      <span>🗑️</span>
                      <span>Del</span>
                    </button>
                  </div>
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
import { ref } from 'vue';
import projectData from '@generate/project';
import { useEditorState } from '@editor/stores/editorState';
const editorState = useEditorState();

// Add new location handler
function addNewLocation() {
  // TODO: Implement add location functionality
  console.log('Add new location');
}

// Edit location handler
function editLocation(locationId: string) {
  editorState.selectedLocation = locationId;
  editorState.activeModule = 'locationEdit';
}

// Delete location handler
async function deleteLocation(locationId: string) {
  await fetch(`/api/delete?path=${encodeURIComponent(`locations/${locationId}`)}`, { method: 'DELETE' });
  locationsArray.value = locationsArray.value.filter((loc) => loc.id !== locationId);
  delete (projectData as any).locations[locationId];
}

// Calculate global events and actions count
const globalStats = {
  eventCount: Object.keys(projectData.global.events).length,
  actionCount: Object.keys(projectData.global.actions).length
};

// Convert locations record to array with stats
const locationsArray = ref(
  Object.entries(projectData.locations).map(([id, locationData]) => ({
    id,
    name: locationData.info!.name,
    eventCount: Object.keys(locationData.events).length,
    actionCount: Object.keys(locationData.actions).length
  }))
);
</script>
