<template>
  <div
    v-if="accessibleLocations.length > 0"
    class="absolute top-0 left-0 w-full h-full z-10 pointer-events-none flex items-end justify-end p-4"
  >
    <!-- Location navigation circles -->
    <div class="flex flex-wrap gap-6 justify-center items-center pointer-events-auto">
      <button
        v-for="location in accessibleLocations"
        :key="location.id"
        @click.stop.prevent="navigateToLocation(location.id)"
        class="location-circle group relative overflow-hidden transition-all duration-300 ease-out transform hover:scale-110 hover:-translate-y-2 focus:outline-none border-none"
        :style="{ width: circleSize + 'px', height: circleSize + 'px' }"
        :title="location.name"
      >
        <!-- Circle background with glass morphism - blue on hover -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm border border-white/20 rounded-full group-hover:bg-blue-600/60 group-focus:bg-blue-600/60 group-hover:border-white/40 group-focus:border-white/40 transition-all duration-300"></div>
        
        <!-- Inner glow ring -->
        <div class="absolute inset-2 rounded-full border border-white/10 group-hover:border-white/30 transition-all duration-300"></div>
        
        <!-- Location name text -->
        <div class="relative w-full h-full flex items-center justify-center p-2">
          <span class="text-white font-semibold text-center text-sm leading-tight group-hover:text-white transition-colors duration-300 drop-shadow-lg">
            {{ location.name }}
          </span>
        </div>
        
        <!-- Subtle gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-full pointer-events-none"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { Engine } from "@/generate/runtime";
import { gameState as useGameState } from '@/generate/stores';
import type { Location } from '@/generate/types';

const gameState = useGameState();
const accessibleLocations = ref<Location[]>([]);

// Calculate circle size as 1/8 of gameRoot size (using smaller dimension)
const circleSize = computed(() => {
  const engine = Engine.getInstance();  
  if (engine == null) {
    console.warn("Engine get error");
    return 120;
  }
  return engine.getGameSize();
});

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
  
  // Resolve the action waiter to continue the game loop
  engine.navigationManager.actionManager.resolve();
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
