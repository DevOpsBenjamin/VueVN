<template>
  <div class="h-full flex flex-col bg-black/10">
    <div class="flex-1 overflow-y-auto">
      <div class="p-6 space-y-6">
        <!-- Header -->
        <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div class="flex items-center space-x-3">
            <button
              @click="goBack"
              class="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-all duration-200 text-white"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <div class="flex-1">
              <h1 class="text-white text-2xl font-bold">
                {{ isGlobal ? '🌐 Global Events & Actions' : `📍 ${locationName}` }}
              </h1>
              <p class="text-white/70 text-sm">
                {{ isGlobal ? 'System-wide events and actions' : `Edit location: ${selectedLocation}` }}
              </p>
            </div>
          </div>
        </section>

        <!-- Placeholder Content -->
        <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div class="text-center py-12">
            <div class="text-6xl mb-4">🚧</div>
            <h2 class="text-white text-xl font-semibold mb-2">Under Construction</h2>
            <p class="text-white/70 mb-4">Location editing interface coming soon...</p>
            <div class="text-white/50 text-sm">
              <p>Current location: <strong>{{ selectedLocation }}</strong></p>
              <p v-if="!isGlobal">Location name: <strong>{{ locationName }}</strong></p>
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

// Computed properties
const selectedLocation = computed(() => editorState.selectedLocation || 'global');
const isGlobal = computed(() => selectedLocation.value === 'global');
const locationName = computed(() => {
  if (isGlobal.value) return 'Global';
  const location = projectData.locations[selectedLocation.value];
  return location?.info?.name || selectedLocation.value;
});

// Go back to location manager
function goBack() {
  editorState.activeModule = 'locationManager';
  editorState.selectedLocation = null;
}
</script>