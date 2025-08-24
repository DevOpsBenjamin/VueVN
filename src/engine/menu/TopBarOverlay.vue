<template>
  <div class="absolute top-0 left-0 w-full z-10 pointer-events-none p-4">
    <div class="w-full flex justify-center pointer-events-auto">
      <div class="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded">
        {{ locationName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { gameState as useGameState } from '@/generate/stores';

const gameState = useGameState();

const locationName = computed(() => {
  return gameState.location_id;
});
</script>
