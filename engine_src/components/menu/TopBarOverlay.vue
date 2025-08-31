<template>
  <div class="absolute top-0 left-0 w-full z-10 pointer-events-none p-2 sm:p-3 lg:p-4">
    <div class="w-full flex justify-center pointer-events-auto">
      <div class="bg-black/30 backdrop-blur-sm text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded text-xs sm:text-sm lg:text-base">
        {{ locationName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { gameState as useGameState } from '@generate/stores';

const gameState = useGameState();

const locationName = computed(() => {
  return gameState.location_id;
});
</script>
