<template>
  <div class="absolute top-0 left-0 w-full z-10 pointer-events-none p-4">
    <div class="w-full flex justify-between items-center pointer-events-auto">
      <div class="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded">
        {{ formattedDate }}
      </div>
      <div class="flex gap-2">
        <button class="bg-black/30 backdrop-blur-sm text-white px-3 py-2 rounded">Inventory</button>
        <button class="bg-black/30 backdrop-blur-sm text-white px-3 py-2 rounded">Phone</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { gameState as useGameState } from '@/generate/stores';

const gameState = useGameState();

const formattedDate = computed(() => {
  const { year, month, day, hour } = gameState.gameTime;
  const y = String(year);
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:00`;
});
</script>
