<template>
  <div
    class="absolute top-0 left-0 w-full z-10 pointer-events-auto flex justify-end p-4"
  >
    <!-- Location navigation buttons -->
    <div v-if="accessibleLocations.length > 0" class="flex flex-wrap gap-2">
      <button
        v-for="location in accessibleLocations"
        :key="location.id"
        @click="navigateToLocation(location.id)"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        :title="location.name"
      >
        {{ location.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Engine } from "@/generate/runtime";
import { gameState as useGameState } from '@/generate/stores';
import type { Location } from '@/generate/types';

const gameState = useGameState();
const accessibleLocations = ref<Location[]>([]);

const updateAccessibleLocations = () => {
  const engine = Engine.getInstance();
  if (engine == null) {
    console.error("Engine get error");
    return;
  }
  
  try {
    const currentLocation = engine.locationManager.findLocationById(gameState.location_id);
    accessibleLocations.value = currentLocation.accessibleLocations;
  } catch (error) {
    console.error('[LocationOverlay] Error updating accessible locations:', error);
    accessibleLocations.value = [];
  }
};

const navigateToLocation = (locationId: string) => {
  const engine = Engine.getInstance();
  if (engine == null) {
    console.error("Engine get error");
    return;
  }  
  // TODO: Add validation logic for access errors
  // For now, just update the location
  gameState.location_id = locationId;
};

onMounted(() => {
  // Watch for location changes
  watch(
    () => gameState.location_id,
    updateAccessibleLocations,
    { immediate: true }
  );
});
</script>
