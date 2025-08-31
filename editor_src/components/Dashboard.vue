<template>
  <div class="h-full flex flex-col bg-black/10">
    <div class="flex-1 overflow-y-auto">
      <div class="p-6 space-y-6">

      <!-- Project Status -->
      <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h2 class="text-white text-lg font-semibold mb-4 flex items-center">
          <span class="mr-2">🎮</span>
          {{ projectData.config.name }}
        </h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="text-center p-4 bg-white/5 rounded-lg border border-white/5">
            <div class="text-2xl text-blue-400 font-bold mb-1">{{ locationsArray.length }}</div>
            <div class="text-white/70 text-sm">Locations</div>
          </div>
          <div class="text-center p-4 bg-white/5 rounded-lg border border-white/5">
            <div class="text-2xl text-green-400 font-bold mb-1">{{ totalEvents }}</div>
            <div class="text-white/70 text-sm">Events</div>
          </div>
          <div class="text-center p-4 bg-white/5 rounded-lg border border-white/5">
            <div class="text-2xl text-purple-400 font-bold mb-1">{{ totalActions }}</div>
            <div class="text-white/70 text-sm">Actions</div>
          </div>
          <div class="text-center p-4 bg-white/5 rounded-lg border border-white/5">
            <div class="text-2xl text-orange-400 font-bold mb-1">{{ globalStats.eventCount }}</div>
            <div class="text-white/70 text-sm">Global Events</div>
          </div>
        </div>

        <!-- Most Active Locations -->
        <div class="bg-white/5 rounded-lg p-4 border border-white/5" v-if="topLocations.length > 0">
          <h3 class="text-white font-medium mb-3 flex items-center">
            <span class="mr-2">🏆</span>
            Most Active Locations
          </h3>
          <div class="space-y-2">
            <div v-for="location in topLocations" :key="location.id" class="flex items-center justify-between p-2 bg-white/5 rounded">
              <div class="flex items-center space-x-2">
                <span class="text-white font-medium text-sm">{{ location.name }}</span>
                <span class="text-white/50 text-xs">{{ location.id }}</span>
              </div>
              <div class="flex items-center space-x-3 text-xs">
                <span class="text-blue-400">{{ location.eventCount }} events</span>
                <span class="text-purple-400">{{ location.actionCount }} actions</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

// Calculate total events and actions across all locations
const totalEvents = computed(() => {
  return locationsArray.reduce((sum, location) => sum + location.eventCount, 0) + globalStats.eventCount;
});

const totalActions = computed(() => {
  return locationsArray.reduce((sum, location) => sum + location.actionCount, 0) + globalStats.actionCount;
});

// Get top 3 most active locations (by total events + actions)
const topLocations = computed(() => {
  return locationsArray
    .map(location => ({
      ...location,
      totalActivity: location.eventCount + location.actionCount
    }))
    .filter(location => location.totalActivity > 0)
    .sort((a, b) => b.totalActivity - a.totalActivity)
    .slice(0, 3);
});
</script>
